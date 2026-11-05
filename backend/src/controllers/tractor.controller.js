import { Tractor } from '../models/Tractor.js'
import { Customer } from '../models/Customer.js'
import { ServiceRecord } from '../models/ServiceRecord.js'
import { MeterReading } from '../models/MeterReading.js'
import { predictNextService } from '../services/servicePrediction.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse, paginated } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { generateId, PREFIXES } from '../utils/generateId.js'
import { getPagination, buildPaginationMeta } from '../utils/pagination.js'
import { createAuditLog } from '../middleware/auditLogger.js'

export const getTractors = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPagination(req.query)
  const filter = {}

  if (req.query.customer) filter.customer = req.query.customer
  if (req.query.brand) filter.brand = req.query.brand
  if (req.query.modelName) filter.modelName = req.query.modelName
  if (req.query.tractorStatus) filter.tractorStatus = req.query.tractorStatus

  if (req.query.search) {
    const s = req.query.search.trim()
    filter.$or = [
      { registrationNumber: { $regex: s, $options: 'i' } },
      { chassisNumber: { $regex: s, $options: 'i' } },
      { engineNumber: { $regex: s, $options: 'i' } },
      { modelName: { $regex: s, $options: 'i' } },
      { tractorId: { $regex: s, $options: 'i' } },
    ]
  }

  const [tractors, total] = await Promise.all([
    Tractor.find(filter)
      .populate('customer', 'customerName mobile village')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Tractor.countDocuments(filter),
  ])

  // Attach quick prediction for each tractor and normalize fields
  const enriched = tractors.map((t) => {
    const prediction = predictNextService(t, [])
    const cust = t.customer ? {
      ...t.customer,
      fullName: t.customer.customerName || t.customer.fullName || '',
      primaryMobile: t.customer.mobile || t.customer.primaryMobile || '',
    } : null

    return {
      ...t,
      model: t.modelName || t.model || '',
      customer: cust || t.customer,
      prediction,
    }
  })

  return paginated(res, enriched, buildPaginationMeta(page, limit, total), 'Tractors retrieved')
})

export const createTractor = asyncHandler(async (req, res) => {
  const { customer, currentEngineHours, serviceIntervalHours = 250 } = req.body

  const custDoc = await Customer.findById(customer)
  if (!custDoc) throw ApiError.notFound('Customer')

  const initialHours = Number(currentEngineHours) || 0
  const tractorId = generateId(PREFIXES.TRACTOR)
  const nextServiceTargetHours = initialHours + Number(serviceIntervalHours)

  const modelName = req.body.modelName || req.body.model || 'Athiran PowerTrac 45 HP'
  const brand = req.body.brand || (modelName.split(' ')[0]) || 'Athiran'
  const hpMatch = modelName.match(/(\d+)\s*HP/i)
  const horsepower = req.body.horsepower ? Number(req.body.horsepower) : (hpMatch ? Number(hpMatch[1]) : 45)

  const tractor = await Tractor.create({
    ...req.body,
    modelName,
    brand,
    horsepower,
    tractorId,
    currentEngineHours: initialHours,
    lastRecordedEngineHours: initialHours,
    lastReadingDate: new Date(),
    nextServiceTargetHours,
    createdBy: req.user._id,
  })

  // Record initial reading
  await MeterReading.create({
    tractor: tractor._id,
    readingHours: initialHours,
    readingDate: new Date(),
    recordedBy: req.user._id,
    notes: 'Initial meter reading upon tractor registration',
  })

  await createAuditLog({
    actor: req.user,
    action: 'create',
    entityType: 'Tractor',
    entityId: tractor._id,
    after: tractor.toObject(),
    req,
  })

  const populated = await Tractor.findById(tractor._id).populate('customer')
  const pObj = populated.toObject()
  pObj.model = pObj.modelName
  if (pObj.customer) {
    pObj.customer.fullName = pObj.customer.customerName
    pObj.customer.primaryMobile = pObj.customer.mobile
  }
  return ApiResponse.created(pObj, 'Tractor registered successfully').send(res)
})

export const getTractorById = asyncHandler(async (req, res) => {
  const tractor = await Tractor.findById(req.params.id).populate('customer')
  if (!tractor) throw ApiError.notFound('Tractor')

  const readings = await MeterReading.find({ tractor: tractor._id })
    .populate('recordedBy', 'fullName')
    .sort({ readingDate: -1 })
    .limit(30)

  const prediction = predictNextService(tractor.toObject(), readings)
  const tObj = tractor.toObject()
  tObj.model = tObj.modelName
  if (tObj.customer) {
    tObj.customer.fullName = tObj.customer.customerName
    tObj.customer.primaryMobile = tObj.customer.mobile
  }

  return ApiResponse.ok({
    ...tObj,
    readings,
    prediction,
  }, 'Tractor details retrieved').send(res)
})

export const updateTractor = asyncHandler(async (req, res) => {
  const tractor = await Tractor.findById(req.params.id)
  if (!tractor) throw ApiError.notFound('Tractor')

  const before = tractor.toObject()
  delete req.body.tractorId
  delete req.body.createdBy

  if (req.body.model) {
    tractor.modelName = req.body.model
    tractor.brand = req.body.brand || req.body.model.split(' ')[0] || tractor.brand
    const hpMatch = req.body.model.match(/(\d+)\s*HP/i)
    if (hpMatch) tractor.horsepower = Number(hpMatch[1])
  }
  if (req.body.modelName) tractor.modelName = req.body.modelName
  if (req.body.brand) tractor.brand = req.body.brand
  if (req.body.registrationNumber !== undefined) tractor.registrationNumber = req.body.registrationNumber
  if (req.body.chassisNumber !== undefined) tractor.chassisNumber = req.body.chassisNumber
  if (req.body.engineNumber !== undefined) tractor.engineNumber = req.body.engineNumber
  if (req.body.purchaseDate !== undefined) tractor.purchaseDate = req.body.purchaseDate
  if (req.body.currentEngineHours !== undefined) tractor.currentEngineHours = Number(req.body.currentEngineHours)
  if (req.body.serviceIntervalHours !== undefined) tractor.serviceIntervalHours = Number(req.body.serviceIntervalHours)

  await tractor.save()

  await createAuditLog({
    actor: req.user,
    action: 'update',
    entityType: 'Tractor',
    entityId: tractor._id,
    before,
    after: tractor.toObject(),
    req,
  })

  const updated = await Tractor.findById(tractor._id).populate('customer')
  const uObj = updated.toObject()
  uObj.model = uObj.modelName
  if (uObj.customer) {
    uObj.customer.fullName = uObj.customer.customerName
    uObj.customer.primaryMobile = uObj.customer.mobile
  }
  return ApiResponse.ok(uObj, 'Tractor updated successfully').send(res)
})

export const deleteTractor = asyncHandler(async (req, res) => {
  const tractor = await Tractor.findById(req.params.id)
  if (!tractor) throw ApiError.notFound('Tractor')

  const before = tractor.toObject()

  await Promise.all([
    Tractor.findByIdAndDelete(req.params.id),
    ServiceRecord.deleteMany({ tractor: req.params.id }),
    MeterReading.deleteMany({ tractor: req.params.id }),
  ])

  await createAuditLog({
    actor: req.user,
    action: 'delete',
    entityType: 'Tractor',
    entityId: tractor._id,
    before,
    req,
  })

  return ApiResponse.ok(null, 'Tractor deleted successfully').send(res)
})

export const getTractorServiceHistory = asyncHandler(async (req, res) => {
  const services = await ServiceRecord.find({ tractor: req.params.id })
    .populate('technician', 'fullName')
    .sort({ serviceDate: -1 })
  return ApiResponse.ok(services, 'Tractor service records').send(res)
})

export const getTractorMeterReadings = asyncHandler(async (req, res) => {
  const readings = await MeterReading.find({ tractor: req.params.id })
    .populate('recordedBy', 'fullName')
    .sort({ readingDate: -1 })
  return ApiResponse.ok(readings, 'Meter readings retrieved').send(res)
})

export const addMeterReading = asyncHandler(async (req, res) => {
  const { readingHours, notes, isCorrection, correctionReason } = req.body
  const hours = Number(readingHours)

  const tractor = await Tractor.findById(req.params.id)
  if (!tractor) throw ApiError.notFound('Tractor')

  // Validation: cannot be less than last recorded unless authorized correction
  if (!isCorrection && hours < tractor.currentEngineHours) {
    throw ApiError.badRequest(
      `New meter reading (${hours} hrs) cannot be less than current recorded hours (${tractor.currentEngineHours} hrs). Mark as correction with a reason if this is a gauge replacement or odometer fix.`
    )
  }

  const reading = await MeterReading.create({
    tractor: tractor._id,
    readingHours: hours,
    readingDate: new Date(),
    recordedBy: req.user._id,
    notes,
    isCorrection: Boolean(isCorrection),
    correctionReason,
  })

  // Update tractor current hours
  tractor.lastRecordedEngineHours = tractor.currentEngineHours
  tractor.currentEngineHours = hours
  tractor.lastReadingDate = new Date()

  // Recalculate predictions
  const allReadings = await MeterReading.find({ tractor: tractor._id }).sort({ readingDate: 1 })
  const prediction = predictNextService(tractor.toObject(), allReadings)

  if (prediction.estimatedServiceDate) {
    tractor.nextServiceEstimatedDate = prediction.estimatedServiceDate
  }

  await tractor.save()

  return ApiResponse.created({ reading, prediction }, 'Meter reading recorded successfully').send(res)
})

export const getNextServicePrediction = asyncHandler(async (req, res) => {
  const tractor = await Tractor.findById(req.params.id)
  if (!tractor) throw ApiError.notFound('Tractor')

  const readings = await MeterReading.find({ tractor: tractor._id }).sort({ readingDate: 1 })
  const prediction = predictNextService(tractor.toObject(), readings)

  return ApiResponse.ok(prediction, 'Service prediction calculated').send(res)
})
