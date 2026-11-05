import { LeaveRequest } from '../models/LeaveRequest.js'
import { LeaveHandover } from '../models/LeaveHandover.js'
import { Lead } from '../models/Lead.js'
import { FollowUp } from '../models/FollowUp.js'
import { Notification } from '../models/Notification.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse, paginated } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { generateId, PREFIXES } from '../utils/generateId.js'
import { getPagination, buildPaginationMeta } from '../utils/pagination.js'
import { createAuditLog } from '../middleware/auditLogger.js'
import { PERMISSIONS } from '../constants/permissions.js'
import dayjs from 'dayjs'

export const getLeaves = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPagination(req.query)
  const perms = req.user.role?.permissions || []
  const filter = {}

  // If not admin, only view own leaves
  if (!perms.includes(PERMISSIONS.LEAVE_APPROVE)) {
    filter.employee = req.user._id
  }

  if (req.query.status) filter.status = req.query.status
  if (req.query.employee && perms.includes(PERMISSIONS.LEAVE_APPROVE)) {
    filter.employee = req.query.employee
  }

  const [leaves, total] = await Promise.all([
    LeaveRequest.find(filter)
      .populate('employee', 'fullName email employeeId department designation')
      .populate('reviewedBy', 'fullName')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    LeaveRequest.countDocuments(filter),
  ])

  return paginated(res, leaves, buildPaginationMeta(page, limit, total), 'Leave requests retrieved')
})

export const applyLeave = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, numberOfDays, reason } = req.body

  const leave = await LeaveRequest.create({
    leaveId: generateId(PREFIXES.LEAVE),
    employee: req.user._id,
    leaveType,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    numberOfDays: Number(numberOfDays) || 1,
    reason,
    status: 'pending',
  })

  await createAuditLog({
    actor: req.user,
    action: 'create',
    entityType: 'LeaveRequest',
    entityId: leave._id,
    after: leave.toObject(),
    req,
  })

  const populated = await LeaveRequest.findById(leave._id).populate('employee')
  return ApiResponse.created(populated, 'Leave request submitted').send(res)
})

export const getLeaveById = asyncHandler(async (req, res) => {
  const leave = await LeaveRequest.findById(req.params.id)
    .populate('employee')
    .populate('reviewedBy', 'fullName')
    .populate({
      path: 'handoverRecord',
      populate: { path: 'coveringEmployee', select: 'fullName employeeId' },
    })

  if (!leave) throw ApiError.notFound('LeaveRequest')
  return ApiResponse.ok(leave, 'Leave details retrieved').send(res)
})

export const approveLeave = asyncHandler(async (req, res) => {
  const leave = await LeaveRequest.findById(req.params.id).populate('employee')
  if (!leave) throw ApiError.notFound('LeaveRequest')

  leave.status = 'approved'
  leave.reviewedBy = req.user._id
  leave.reviewedAt = new Date()
  await leave.save()

  await Notification.create({
    recipient: leave.employee._id,
    type: 'leave_approved',
    title: 'Leave Request Approved',
    message: `Your ${leave.leaveType} leave request from ${dayjs(leave.startDate).format('DD MMM')} to ${dayjs(leave.endDate).format('DD MMM')} has been approved.`,
    entityType: 'leave',
    entityId: leave._id,
  })

  await createAuditLog({
    actor: req.user,
    action: 'approve',
    entityType: 'LeaveRequest',
    entityId: leave._id,
    after: { status: 'approved' },
    req,
  })

  return ApiResponse.ok(leave, 'Leave request approved successfully').send(res)
})

export const rejectLeave = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body
  const leave = await LeaveRequest.findById(req.params.id).populate('employee')
  if (!leave) throw ApiError.notFound('LeaveRequest')

  leave.status = 'rejected'
  leave.reviewedBy = req.user._id
  leave.reviewedAt = new Date()
  leave.rejectionReason = rejectionReason || 'Rejected by administrator'
  await leave.save()

  await Notification.create({
    recipient: leave.employee._id,
    type: 'leave_rejected',
    title: 'Leave Request Rejected',
    message: `Your leave request was rejected. Reason: ${leave.rejectionReason}`,
    entityType: 'leave',
    entityId: leave._id,
  })

  await createAuditLog({
    actor: req.user,
    action: 'reject',
    entityType: 'LeaveRequest',
    entityId: leave._id,
    after: { status: 'rejected', rejectionReason },
    req,
  })

  return ApiResponse.ok(leave, 'Leave request rejected').send(res)
})

export const handoverLeads = asyncHandler(async (req, res) => {
  const { handoverType, coveringEmployee, handoverSummary } = req.body
  const leave = await LeaveRequest.findById(req.params.id).populate('employee')
  if (!leave) throw ApiError.notFound('LeaveRequest')

  // Find leads assigned to the employee going on leave
  const employeeLeads = await Lead.find({ assignedTo: leave.employee._id, status: { $nin: ['converted', 'lost'] } })
  const leadIds = employeeLeads.map((l) => l._id)

  // Find pending follow-ups
  const pendingFollowups = await FollowUp.find({ assignedTo: leave.employee._id, status: 'pending' })
  const followupIds = pendingFollowups.map((f) => f._id)

  if (handoverType === 'reassign' && coveringEmployee) {
    // Option B: Reassign to covering employee
    await Lead.updateMany({ _id: { $in: leadIds } }, { assignedTo: coveringEmployee })
    await FollowUp.updateMany({ _id: { $in: followupIds } }, { assignedTo: coveringEmployee })

    await Notification.create({
      recipient: coveringEmployee,
      type: 'handover_completed',
      title: 'Temporary Lead Handover Assigned',
      message: `${leadIds.length} leads handed over covering for ${leave.employee.fullName}.`,
      entityType: 'leave',
    })
  }

  // Create permanent Handover Record
  const handoverRecord = await LeaveHandover.create({
    leaveRequest: leave._id,
    originalEmployee: leave.employee._id,
    coveringEmployee: handoverType === 'reassign' ? coveringEmployee : null,
    handoverType,
    leadsHandedOver: leadIds,
    followUpsTransferred: followupIds,
    handoverSummary: handoverSummary || (handoverType === 'admin_handles' ? 'Supervised by Administrator' : 'Reassigned to covering employee'),
    performedBy: req.user._id,
  })

  leave.handoverOption = handoverType
  leave.handoverRecord = handoverRecord._id
  await leave.save()

  return ApiResponse.ok(handoverRecord, 'Lead handover configured successfully').send(res)
})

export const getLeaveCalendar = asyncHandler(async (req, res) => {
  const approvedLeaves = await LeaveRequest.find({ status: 'approved' })
    .populate('employee', 'fullName department designation')
    .sort({ startDate: 1 })

  const events = approvedLeaves.map((l) => ({
    id: l._id,
    employeeName: l.employee?.fullName,
    department: l.employee?.department,
    leaveType: l.leaveType,
    startDate: l.startDate,
    endDate: l.endDate,
    numberOfDays: l.numberOfDays,
  }))

  return ApiResponse.ok(events, 'Leave calendar retrieved').send(res)
})

export const deleteLeave = asyncHandler(async (req, res) => {
  const leave = await LeaveRequest.findById(req.params.id)
  if (!leave) throw ApiError.notFound('LeaveRequest')

  await LeaveRequest.findByIdAndDelete(req.params.id)
  return ApiResponse.ok(null, 'Leave request removed').send(res)
})
