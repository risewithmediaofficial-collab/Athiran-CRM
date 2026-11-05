import { ServiceRecord } from '../models/ServiceRecord.js'
import { Tractor } from '../models/Tractor.js'
import { Customer } from '../models/Customer.js'
import { MeterReading } from '../models/MeterReading.js'
import { predictNextService } from '../services/servicePrediction.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse, paginated } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { generateId, PREFIXES } from '../utils/generateId.js'
import { getPagination, buildPaginationMeta } from '../utils/pagination.js'
import { createAuditLog } from '../middleware/auditLogger.js'
import dayjs from 'dayjs'

export const getServices = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPagination(req.query)
  const filter = {}

  if (req.query.status) filter.status = req.query.status
  if (req.query.serviceType) filter.serviceType = req.query.serviceType
  if (req.query.tractor) filter.tractor = req.query.tractor
  if (req.query.customer) filter.customer = req.query.customer
  if (req.query.technician) filter.technician = req.query.technician

  const [services, total] = await Promise.all([
    ServiceRecord.find(filter)
      .populate('customer', 'customerName mobile village')
      .populate('tractor', 'modelName registrationNumber brand currentEngineHours')
      .populate('technician', 'fullName')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    ServiceRecord.countDocuments(filter),
  ])

  const enriched = services.map((s) => {
    const sObj = s.toObject()
    if (sObj.customer) {
      sObj.customer.fullName = sObj.customer.customerName || sObj.customer.fullName || ''
      sObj.customer.primaryMobile = sObj.customer.mobile || sObj.customer.primaryMobile || ''
    }
    if (sObj.tractor) {
      sObj.tractor.model = sObj.tractor.modelName || sObj.tractor.model || ''
    }
    return sObj
  })

  return paginated(res, enriched, buildPaginationMeta(page, limit, total), 'Services retrieved')
})

export const createService = asyncHandler(async (req, res) => {
  const { customer, tractor, currentEngineHours, serviceType } = req.body

  const tractorDoc = await Tractor.findById(tractor)
  if (!tractorDoc) throw ApiError.notFound('Tractor')

  const serviceId = generateId(PREFIXES.SERVICE)
  const hours = Number(currentEngineHours) || tractorDoc.currentEngineHours
  const previousHours = tractorDoc.lastServiceHours || 0
  const serviceDate = req.body.serviceDate || req.body.scheduledDate || new Date()
  const serviceCost = Number(req.body.serviceCost) || Number(req.body.cost?.totalCost) || 0
  const complaint = req.body.complaint || req.body.customerComplaints || 'Periodic Maintenance'

  const service = await ServiceRecord.create({
    ...req.body,
    serviceId,
    customer,
    tractor,
    serviceDate,
    complaint,
    currentEngineHours: hours,
    previousServiceHours: previousHours,
    hoursOperated: Math.max(0, hours - previousHours),
    serviceCost,
    createdBy: req.user._id,
  })

  // Update tractor last service info & next service target
  tractorDoc.lastServiceHours = hours
  tractorDoc.lastServiceDate = serviceDate
  if (hours > tractorDoc.currentEngineHours) {
    tractorDoc.currentEngineHours = hours
  }
  const interval = tractorDoc.serviceIntervalHours || 250
  tractorDoc.nextServiceTargetHours = hours + interval
  await tractorDoc.save()

  // Log meter reading automatically
  await MeterReading.create({
    tractor: tractorDoc._id,
    readingHours: hours,
    readingDate: serviceDate,
    recordedBy: req.user._id,
    notes: `Service ${serviceId} (${serviceType}) recorded meter reading`,
  })

  await createAuditLog({
    actor: req.user,
    action: 'create',
    entityType: 'ServiceRecord',
    entityId: service._id,
    after: service.toObject(),
    req,
  })

  const populated = await ServiceRecord.findById(service._id)
    .populate('customer')
    .populate('tractor')
    .populate('technician', 'fullName')

  return ApiResponse.created(populated, 'Service record created successfully').send(res)
})

export const getServiceById = asyncHandler(async (req, res) => {
  const service = await ServiceRecord.findById(req.params.id)
    .populate('customer')
    .populate('tractor')
    .populate('technician', 'fullName mobile designation')
    .populate('serviceAdvisor', 'fullName')

  if (!service) throw ApiError.notFound('ServiceRecord')
  return ApiResponse.ok(service, 'Service record retrieved').send(res)
})

export const updateService = asyncHandler(async (req, res) => {
  const service = await ServiceRecord.findById(req.params.id)
  if (!service) throw ApiError.notFound('ServiceRecord')

  const before = service.toObject()
  delete req.body.serviceId
  delete req.body.createdBy

  Object.assign(service, req.body)
  await service.save()

  await createAuditLog({
    actor: req.user,
    action: 'update',
    entityType: 'ServiceRecord',
    entityId: service._id,
    before,
    after: service.toObject(),
    req,
  })

  const updated = await ServiceRecord.findById(service._id)
    .populate('customer')
    .populate('tractor')
    .populate('technician', 'fullName')

  return ApiResponse.ok(updated, 'Service record updated').send(res)
})

export const deleteService = asyncHandler(async (req, res) => {
  const service = await ServiceRecord.findById(req.params.id)
  if (!service) throw ApiError.notFound('ServiceRecord')

  const before = service.toObject()
  await ServiceRecord.findByIdAndDelete(req.params.id)

  await createAuditLog({
    actor: req.user,
    action: 'delete',
    entityType: 'ServiceRecord',
    entityId: service._id,
    before,
    req,
  })

  return ApiResponse.ok(null, 'Service record deleted').send(res)
})

export const getServiceDashboardStats = asyncHandler(async (req, res) => {
  const todayStart = dayjs().startOf('day').toDate()
  const todayEnd = dayjs().endOf('day').toDate()
  const weekEnd = dayjs().add(7, 'day').endOf('day').toDate()

  const [
    totalCustomers,
    totalTractors,
    totalServices,
    servicesToday,
    pendingServices,
    completedServices,
    servicesThisWeek,
  ] = await Promise.all([
    Customer.countDocuments({}),
    Tractor.countDocuments({}),
    ServiceRecord.countDocuments({}),
    ServiceRecord.countDocuments({ serviceDate: { $gte: todayStart, $lte: todayEnd } }),
    ServiceRecord.countDocuments({ status: { $in: ['pending', 'in_progress', 'scheduled'] } }),
    ServiceRecord.countDocuments({ status: 'completed' }),
    ServiceRecord.countDocuments({ serviceDate: { $gte: todayStart, $lte: weekEnd } }),
  ])

  // Count tractors overdue by hours
  const allTractors = await Tractor.find({ tractorStatus: 'active' }).lean()
  let tractorsDueByHours = 0
  let tractorsOverdue = 0

  allTractors.forEach((t) => {
    const pred = predictNextService(t, [])
    if (pred.isOverdue) tractorsOverdue++
    else if (pred.alertLevel === 'critical' || pred.alertLevel === 'warning') tractorsDueByHours++
  })

  return ApiResponse.ok({
    totalCustomers,
    totalTractors,
    totalServices,
    servicesToday,
    pendingServices,
    completedServices,
    servicesThisWeek,
    tractorsDueByHours,
    tractorsOverdue,
  }, 'Service dashboard stats').send(res)
})

export const getServiceCalendar = asyncHandler(async (req, res) => {
  const services = await ServiceRecord.find({ status: { $ne: 'cancelled' } })
    .populate('customer', 'customerName mobile')
    .populate('tractor', 'modelName registrationNumber brand')
    .sort({ serviceDate: 1 })

  const events = services.map((s) => ({
    id: s._id,
    title: `${s.customer?.customerName || 'Customer'} - ${s.tractor?.modelName || 'Tractor'} (${s.serviceType})`,
    date: s.serviceDate,
    status: s.status,
    serviceId: s.serviceId,
    customerName: s.customer?.customerName,
    mobile: s.customer?.mobile,
    tractorModel: s.tractor?.modelName,
  }))

  return ApiResponse.ok(events, 'Service calendar events').send(res)
})
