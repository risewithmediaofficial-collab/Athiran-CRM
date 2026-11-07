import argon2 from 'argon2'
import { User } from '../models/User.js'
import { Lead } from '../models/Lead.js'
import { FollowUp } from '../models/FollowUp.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse, paginated } from '../utils/ApiResponse.js'
import { generateId, PREFIXES } from '../utils/generateId.js'
import { createAuditLog } from '../middleware/auditLogger.js'

// ─── getUsers ─────────────────────────────────────────────────────────────────
export const getUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    department,
    role,
    accountStatus,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query

  const filter = {}

  if (department) filter.department = department
  if (role) filter.role = role
  if (accountStatus) filter.accountStatus = accountStatus
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }

  const [users, total] = await Promise.all([
    User.find(filter)
      .populate('role', 'name displayName department')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    User.countDocuments(filter),
  ])

  const totalPages = Math.ceil(total / Number(limit))

  paginated(res, users, {
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages,
    hasNextPage: Number(page) < totalPages,
    hasPrevPage: Number(page) > 1,
  }, 'Users fetched successfully')
})

// ─── createUser ───────────────────────────────────────────────────────────────
export const createUser = asyncHandler(async (req, res) => {
  const {
    fullName,
    email,
    username,
    password,
    role,
    department,
    designation,
    mobile,
    alternateMobile,
    joiningDate,
    assignedManager,
    profileImage,
  } = req.body

  // Check for duplicates
  const existing = await User.findOne({
    $or: [
      { email: email.toLowerCase() },
      { username: username.toLowerCase() },
    ],
  })
  if (existing) {
    if (existing.email === email.toLowerCase()) {
      throw ApiError.conflict('A user with this email already exists.')
    }
    throw ApiError.conflict('A user with this username already exists.')
  }

  const employeeId = generateId(PREFIXES.EMPLOYEE)
  const passwordHash = await argon2.hash(password)

  const user = await User.create({
    employeeId,
    fullName,
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    passwordHash,
    role,
    department: (department || 'sales').toLowerCase(),
    designation,
    mobile,
    alternateMobile,
    joiningDate: joiningDate || new Date(),
    assignedManager: assignedManager || undefined,
    profileImage,
    createdBy: req.user._id,
    accountStatus: 'active',
  })

  const populated = await User.findById(user._id).populate('role', 'name displayName department')

  await createAuditLog({
    actor: req.user._id,
    action: 'USER_CREATE',
    entityType: 'User',
    entityId: user._id,
    after: populated.toJSON(),
    req,
  })

  ApiResponse.created(populated, 'User created successfully').send(res)
})

// ─── getUserById ──────────────────────────────────────────────────────────────
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('role', 'name displayName permissions department')
    .populate('assignedManager', 'fullName employeeId designation')

  if (!user) throw ApiError.notFound('User')

  ApiResponse.ok(user, 'User fetched successfully').send(res)
})

// ─── updateUser ───────────────────────────────────────────────────────────────
export const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ['fullName', 'email', 'mobile', 'designation', 'role', 'department', 'assignedManager', 'profileImage', 'alternateMobile']
  const updates = {}

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === 'department' && req.body[field]) {
        updates[field] = String(req.body[field]).toLowerCase()
      } else {
        updates[field] = req.body[field]
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    throw ApiError.badRequest('No valid fields provided for update.')
  }

  const before = await User.findById(req.params.id)
  if (!before) throw ApiError.notFound('User')

  const after = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('role', 'name displayName department')
   .populate('assignedManager', 'fullName employeeId designation')

  await createAuditLog({
    actor: req.user._id,
    action: 'USER_UPDATE',
    entityType: 'User',
    entityId: after._id,
    before: before.toJSON(),
    after: after.toJSON(),
    req,
  })

  ApiResponse.ok(after, 'User updated successfully').send(res)
})

// ─── updateUserStatus ─────────────────────────────────────────────────────────
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { accountStatus } = req.body

  const user = await User.findById(req.params.id)
  if (!user) throw ApiError.notFound('User')

  const before = { accountStatus: user.accountStatus }
  user.accountStatus = accountStatus
  await user.save()

  await createAuditLog({
    actor: req.user._id,
    action: 'USER_STATUS_CHANGE',
    entityType: 'User',
    entityId: user._id,
    before,
    after: { accountStatus },
    req,
  })

  ApiResponse.ok({ accountStatus: user.accountStatus }, 'User status updated successfully').send(res)
})

// ─── resetUserPassword ────────────────────────────────────────────────────────
export const resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body

  const user = await User.findById(req.params.id).select('+refreshTokens')
  if (!user) throw ApiError.notFound('User')

  user.passwordHash = await argon2.hash(newPassword)
  user.refreshTokens = [] // Force re-login on all devices
  await user.save()

  await createAuditLog({
    actor: req.user._id,
    action: 'USER_PASSWORD_RESET',
    entityType: 'User',
    entityId: user._id,
    req,
  })

  ApiResponse.ok(null, 'Password reset successfully. User must log in again.').send(res)
})

// ─── getUserPerformance ───────────────────────────────────────────────────────
export const getUserPerformance = asyncHandler(async (req, res) => {
  const userId = req.params.id

  const user = await User.findById(userId)
  if (!user) throw ApiError.notFound('User')

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [
    totalLeads,
    convertedLeads,
    lostLeads,
    followupsCompleted,
    followupsMissed,
  ] = await Promise.all([
    Lead.countDocuments({ assignedTo: userId }),
    Lead.countDocuments({ assignedTo: userId, status: 'converted' }),
    Lead.countDocuments({ assignedTo: userId, status: 'lost' }),
    FollowUp.countDocuments({ assignedTo: userId, status: 'completed' }),
    FollowUp.countDocuments({
      assignedTo: userId,
      status: 'pending',
      scheduledDate: { $lt: startOfToday },
    }),
  ])

  const activeLeads = totalLeads - convertedLeads - lostLeads
  const conversionRate = totalLeads > 0
    ? ((convertedLeads / totalLeads) * 100).toFixed(1)
    : '0.0'

  const performance = {
    userId,
    employeeId: user.employeeId,
    fullName: user.fullName,
    summary: {
      totalLeads,
      convertedLeads,
      lostLeads,
      activeLeads,
      conversionRate: `${conversionRate}%`,
      followupsCompleted,
      followupsMissed,
    },
  }

  ApiResponse.ok(performance, 'Performance data fetched successfully').send(res)
})

// ─── deleteUser ───────────────────────────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('role', 'name')
  if (!user) throw ApiError.notFound('User')

  if (String(user._id) === String(req.user._id)) {
    throw ApiError.badRequest('You cannot delete your own account.')
  }

  if (user.role?.name === 'super_admin') {
    throw ApiError.forbidden('The Super Admin account cannot be deleted.')
  }

  const before = user.toObject()
  await User.findByIdAndDelete(req.params.id)

  await createAuditLog({
    actor: req.user._id,
    action: 'delete',
    entityType: 'User',
    entityId: user._id,
    before,
    req,
  })

  ApiResponse.ok(null, 'Employee account deleted successfully').send(res)
})
