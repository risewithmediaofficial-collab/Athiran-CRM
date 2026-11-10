import { TractorModel } from '../models/TractorModel.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { createAuditLog } from '../middleware/auditLogger.js'

const sanitizeModelPayload = (body) => {
  const payload = { ...body }
  // Ensure pricing fields are never stored even if passed
  delete payload.price
  delete payload.minPrice
  delete payload.maxPrice
  delete payload.priceRange
  return payload
}

export const getTractorModels = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.includeInactive !== 'true') {
    filter.isActive = true
  }
  if (req.query.category) {
    filter.category = req.query.category
  }
  if (req.query.search) {
    const s = req.query.search.trim()
    filter.$or = [
      { modelName: { $regex: s, $options: 'i' } },
      { brand: { $regex: s, $options: 'i' } },
      { category: { $regex: s, $options: 'i' } },
      { hpDisplay: { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
    ]
  }

  const models = await TractorModel.find(filter)
    .sort({ sortOrder: 1, horsepower: 1, modelName: 1 })
    .lean()

  return ApiResponse.ok(models, 'Tractor models retrieved').send(res)
})

export const getTractorModelById = asyncHandler(async (req, res) => {
  const model = await TractorModel.findById(req.params.id).lean()
  if (!model) throw ApiError.notFound('TractorModel')
  return ApiResponse.ok(model, 'Tractor model retrieved').send(res)
})

export const createTractorModel = asyncHandler(async (req, res) => {
  const clean = sanitizeModelPayload(req.body)
  const rawName = (clean.modelName || '').trim()
  if (!rawName) throw ApiError.badRequest('Model name is required')

  const modelCode =
    (clean.modelCode || rawName.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32))
      .toUpperCase()

  const existing = await TractorModel.findOne({
    $or: [{ modelName: rawName }, { modelCode }],
  })
  if (existing) {
    throw ApiError.conflict('A tractor model with this name or code already exists.')
  }

  const horsepower = Number(clean.horsepower) || 40
  const model = await TractorModel.create({
    modelCode,
    modelName: rawName,
    brand: (clean.brand || 'Massey Ferguson').trim(),
    category: (clean.category || 'Utility & Agricultural').trim(),
    horsepower,
    hpDisplay: (clean.hpDisplay || `${horsepower} HP`).trim(),
    description: (clean.description || '').trim(),
    specs: clean.specs || {},
    serviceIntervalHours: Number(clean.serviceIntervalHours) || 250,
    sortOrder: clean.sortOrder !== undefined ? Number(clean.sortOrder) : 50,
    isActive: clean.isActive !== undefined ? Boolean(clean.isActive) : true,
  })

  await createAuditLog({
    actor: req.user,
    action: 'create',
    entityType: 'TractorModel',
    entityId: model._id,
    after: model.toObject(),
    req,
  })

  return ApiResponse.created(model, 'Tractor model added to database').send(res)
})

export const updateTractorModel = asyncHandler(async (req, res) => {
  const existing = await TractorModel.findById(req.params.id)
  if (!existing) throw ApiError.notFound('TractorModel')

  const before = existing.toObject()
  const clean = sanitizeModelPayload(req.body)

  const scalarFields = [
    'modelName',
    'brand',
    'category',
    'horsepower',
    'hpDisplay',
    'description',
    'serviceIntervalHours',
    'sortOrder',
    'isActive',
  ]

  for (const field of scalarFields) {
    if (clean[field] !== undefined) {
      existing[field] = clean[field]
    }
  }

  if (clean.specs && typeof clean.specs === 'object') {
    existing.specs = {
      ...(existing.specs?.toObject ? existing.specs.toObject() : existing.specs),
      ...clean.specs,
    }
  }

  await existing.save()

  await createAuditLog({
    actor: req.user,
    action: 'update',
    entityType: 'TractorModel',
    entityId: existing._id,
    before,
    after: existing.toObject(),
    req,
  })

  return ApiResponse.ok(existing, 'Tractor model updated successfully').send(res)
})

export const deleteTractorModel = asyncHandler(async (req, res) => {
  const model = await TractorModel.findByIdAndDelete(req.params.id)
  if (!model) throw ApiError.notFound('TractorModel')

  await createAuditLog({
    actor: req.user,
    action: 'delete',
    entityType: 'TractorModel',
    entityId: model._id,
    before: model.toObject(),
    req,
  })

  return ApiResponse.ok(null, 'Tractor model removed').send(res)
})

