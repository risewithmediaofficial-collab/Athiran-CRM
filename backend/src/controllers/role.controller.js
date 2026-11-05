import { Role } from '../models/Role.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { createAuditLog } from '../middleware/auditLogger.js'

export const getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find().sort({ name: 1 })
  return ApiResponse.ok(roles, 'Roles retrieved').send(res)
})

export const createRole = asyncHandler(async (req, res) => {
  const { name, displayName, permissions, department } = req.body
  const existing = await Role.findOne({ name })
  if (existing) throw ApiError.conflict('Role with this name already exists')

  const role = await Role.create({
    name,
    displayName,
    permissions: permissions || [],
    department,
    isSystem: false,
  })

  await createAuditLog({
    actor: req.user,
    action: 'create',
    entityType: 'Role',
    entityId: role._id,
    after: role.toObject(),
    req,
  })

  return ApiResponse.created(role, 'Role created').send(res)
})

export const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { permissions, displayName } = req.body

  const role = await Role.findById(id)
  if (!role) throw ApiError.notFound('Role')

  const before = role.toObject()

  if (displayName) role.displayName = displayName
  if (permissions) role.permissions = permissions
  await role.save()

  await createAuditLog({
    actor: req.user,
    action: 'update',
    entityType: 'Role',
    entityId: role._id,
    before,
    after: role.toObject(),
    req,
  })

  return ApiResponse.ok(role, 'Role updated').send(res)
})

