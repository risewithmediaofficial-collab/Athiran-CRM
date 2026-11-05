import { Customer } from '../models/Customer.js'
import { Tractor } from '../models/Tractor.js'
import { ServiceRecord } from '../models/ServiceRecord.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse, paginated } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { generateId, PREFIXES } from '../utils/generateId.js'
import { getPagination, buildPaginationMeta } from '../utils/pagination.js'
import { createAuditLog } from '../middleware/auditLogger.js'

export const getCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPagination(req.query)
  const filter = {}

  if (req.query.search) {
    const s = req.query.search.trim()
    filter.$or = [
      { customerName: { $regex: s, $options: 'i' } },
      { mobile: { $regex: s, $options: 'i' } },
      { customerId: { $regex: s, $options: 'i' } },
      { village: { $regex: s, $options: 'i' } },
    ]
  }

  const [customers, total] = await Promise.all([
    Customer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Customer.countDocuments(filter),
  ])

  // Attach tractor count for each customer
  const customerIds = customers.map((c) => c._id)
  const tractorCounts = await Tractor.aggregate([
    { $match: { customer: { $in: customerIds } } },
    { $group: { _id: '$customer', count: { $sum: 1 } } },
  ])
  const countMap = {}
  tractorCounts.forEach((tc) => { countMap[String(tc._id)] = tc.count })

  const enriched = customers.map((c) => ({
    ...c,
    fullName: c.customerName || c.fullName || '',
    primaryMobile: c.mobile || c.primaryMobile || '',
    tractorCount: countMap[String(c._id)] || 0,
  }))

  return paginated(res, enriched, buildPaginationMeta(page, limit, total), 'Customers retrieved')
})

export const createCustomer = asyncHandler(async (req, res) => {
  const customerName = req.body.customerName || req.body.fullName
  const mobile = req.body.mobile || req.body.primaryMobile
  const alternateMobile = req.body.alternateMobile || undefined
  const email = req.body.email || undefined
  const village = req.body.village || req.body.address?.village || ''
  const district = req.body.district || req.body.address?.district || ''
  const state = req.body.state || req.body.address?.state || 'Tamil Nadu'
  const pinCode = req.body.pinCode || req.body.pincode || req.body.address?.pincode || ''
  const notes = req.body.notes || ''
  const customerType = req.body.customerType || 'farmer'

  const customer = await Customer.create({
    customerName,
    mobile,
    alternateMobile,
    email,
    village,
    district,
    state,
    pinCode,
    notes,
    customerType,
    customerId: generateId(PREFIXES.CUSTOMER),
    createdBy: req.user._id,
  })

  await createAuditLog({
    actor: req.user,
    action: 'create',
    entityType: 'Customer',
    entityId: customer._id,
    after: customer.toObject(),
    req,
  })

  const cObj = customer.toObject()
  cObj.fullName = cObj.customerName
  cObj.primaryMobile = cObj.mobile

  return ApiResponse.created(cObj, 'Customer created successfully').send(res)
})

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id)
  if (!customer) throw ApiError.notFound('Customer')

  const tractors = await Tractor.find({ customer: customer._id }).sort({ createdAt: -1 })
  const cObj = customer.toObject()
  cObj.fullName = cObj.customerName
  cObj.primaryMobile = cObj.mobile

  return ApiResponse.ok({ ...cObj, tractors }, 'Customer retrieved').send(res)
})

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id)
  if (!customer) throw ApiError.notFound('Customer')

  const before = customer.toObject()
  delete req.body.customerId
  delete req.body.createdBy

  if (req.body.fullName) customer.customerName = req.body.fullName
  if (req.body.customerName) customer.customerName = req.body.customerName
  if (req.body.primaryMobile) customer.mobile = req.body.primaryMobile
  if (req.body.mobile) customer.mobile = req.body.mobile
  if (req.body.alternateMobile !== undefined) customer.alternateMobile = req.body.alternateMobile
  if (req.body.email !== undefined) customer.email = req.body.email
  if (req.body.village !== undefined) customer.village = req.body.village
  if (req.body.address?.village !== undefined) customer.village = req.body.address.village
  if (req.body.district !== undefined) customer.district = req.body.district
  if (req.body.address?.district !== undefined) customer.district = req.body.address.district
  if (req.body.state !== undefined) customer.state = req.body.state
  if (req.body.address?.state !== undefined) customer.state = req.body.address.state
  if (req.body.pinCode !== undefined) customer.pinCode = req.body.pinCode
  if (req.body.pincode !== undefined) customer.pinCode = req.body.pincode
  if (req.body.address?.pincode !== undefined) customer.pinCode = req.body.address.pincode
  if (req.body.notes !== undefined) customer.notes = req.body.notes
  if (req.body.customerType) customer.customerType = req.body.customerType

  await customer.save()

  await createAuditLog({
    actor: req.user,
    action: 'update',
    entityType: 'Customer',
    entityId: customer._id,
    before,
    after: customer.toObject(),
    req,
  })

  const updatedObj = customer.toObject()
  updatedObj.fullName = updatedObj.customerName
  updatedObj.primaryMobile = updatedObj.mobile

  return ApiResponse.ok(updatedObj, 'Customer updated successfully').send(res)
})

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id)
  if (!customer) throw ApiError.notFound('Customer')

  const before = customer.toObject()

  // Remove customer and their tractors & services
  await Promise.all([
    Customer.findByIdAndDelete(req.params.id),
    Tractor.deleteMany({ customer: req.params.id }),
    ServiceRecord.deleteMany({ customer: req.params.id }),
  ])

  await createAuditLog({
    actor: req.user,
    action: 'delete',
    entityType: 'Customer',
    entityId: customer._id,
    before,
    req,
  })

  return ApiResponse.ok(null, 'Customer and associated tractors deleted').send(res)
})

export const getCustomerTractors = asyncHandler(async (req, res) => {
  const tractors = await Tractor.find({ customer: req.params.id }).sort({ createdAt: -1 })
  return ApiResponse.ok(tractors, 'Customer tractors').send(res)
})

export const getCustomerServices = asyncHandler(async (req, res) => {
  const services = await ServiceRecord.find({ customer: req.params.id })
    .populate('tractor', 'modelName registrationNumber brand')
    .populate('technician', 'fullName')
    .sort({ serviceDate: -1 })
  return ApiResponse.ok(services, 'Customer services').send(res)
})
