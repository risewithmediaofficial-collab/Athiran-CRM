import { Lead } from '../models/Lead.js'
import { LeadActivity } from '../models/LeadActivity.js'
import { LeadAssignment } from '../models/LeadAssignment.js'
import { Notification } from '../models/Notification.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse, paginated } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { generateId, PREFIXES } from '../utils/generateId.js'
import { getPagination, buildPaginationMeta } from '../utils/pagination.js'
import { createAuditLog } from '../middleware/auditLogger.js'
import { PERMISSIONS } from '../constants/permissions.js'
import dayjs from 'dayjs'

// Helper to build role/ownership filter
const getLeadQueryScope = (user) => {
  const userPerms = user.role?.permissions || []
  if (userPerms.includes(PERMISSIONS.LEADS_VIEW_ALL)) {
    return {} // Admin / Super Admin can see all
  }
  // Sales manager / executive / telecaller: only own assigned leads
  return { assignedTo: user._id }
}

export const getLeads = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPagination(req.query)
  const baseScope = getLeadQueryScope(req.user)

  const filter = { ...baseScope, isArchived: false }

  // Query filters
  if (req.query.status) filter.status = req.query.status
  if (req.query.leadTemperature) filter.leadTemperature = req.query.leadTemperature
  if (req.query.leadSource) filter.leadSource = req.query.leadSource
  if (req.query.priority) filter.priority = req.query.priority
  if (req.query.assignedTo && (req.user.role?.permissions || []).includes(PERMISSIONS.LEADS_VIEW_ALL)) {
    filter.assignedTo = req.query.assignedTo
  }
  if (req.query.search) {
    const s = req.query.search.trim()
    filter.$or = [
      { customerName: { $regex: s, $options: 'i' } },
      { primaryMobile: { $regex: s, $options: 'i' } },
      { leadId: { $regex: s, $options: 'i' } },
      { tractorModelInterested: { $regex: s, $options: 'i' } },
    ]
  }

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate('assignedTo', 'fullName email mobile employeeId')
      .populate('createdBy', 'fullName email employeeId')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Lead.countDocuments(filter),
  ])

  return paginated(res, leads, buildPaginationMeta(page, limit, total), 'Leads retrieved')
})

export const createLead = asyncHandler(async (req, res) => {
  const leadDate = req.body.leadDate || req.body.enquiryDate || new Date()
  const leadData = {
    ...req.body,
    leadDate,
    leadId: generateId(PREFIXES.LEAD),
    createdBy: req.user._id,
    assignedTo: req.body.assignedTo || req.user._id,
  }

  const lead = await Lead.create(leadData)

  // Record initial activity
  await LeadActivity.create({
    lead: lead._id,
    activityType: 'note',
    performedBy: req.user._id,
    description: `Lead created from source: ${lead.leadSource}`,
    outcome: 'Lead created in system',
  })

  // Record initial assignment
  await LeadAssignment.create({
    lead: lead._id,
    assignedTo: lead.assignedTo,
    assignedBy: req.user._id,
    reason: 'Initial assignment upon lead creation',
  })

  // Audit log
  await createAuditLog({
    actor: req.user,
    action: 'create',
    entityType: 'Lead',
    entityId: lead._id,
    after: lead.toObject(),
    req,
  })

  // Notification if assigned to someone else
  if (String(lead.assignedTo) !== String(req.user._id)) {
    await Notification.create({
      recipient: lead.assignedTo,
      type: 'lead_assigned',
      title: 'New Lead Assigned',
      message: `You have been assigned lead ${lead.customerName} (${lead.leadId})`,
      entityType: 'lead',
      entityId: lead._id,
    })
  }

  const populated = await Lead.findById(lead._id)
    .populate('assignedTo', 'fullName email mobile')
    .populate('createdBy', 'fullName email')

  return ApiResponse.created(populated, 'Lead created successfully').send(res)
})

export const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
    .populate('assignedTo', 'fullName email mobile employeeId department designation')
    .populate('createdBy', 'fullName email employeeId')

  if (!lead) throw ApiError.notFound('Lead')

  // Check IDOR / ownership
  const perms = req.user.role?.permissions || []
  if (!perms.includes(PERMISSIONS.LEADS_VIEW_ALL)) {
    if (String(lead.assignedTo?._id) !== String(req.user._id)) {
      throw ApiError.forbidden('You do not have permission to view this lead.')
    }
  }

  return ApiResponse.ok(lead, 'Lead details retrieved').send(res)
})

export const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  if (!lead) throw ApiError.notFound('Lead')

  const perms = req.user.role?.permissions || []
  const isOwner = String(lead.assignedTo) === String(req.user._id)
  const canEditAll = perms.includes(PERMISSIONS.LEADS_EDIT_ALL)

  if (!isOwner && !canEditAll) {
    throw ApiError.forbidden('You do not have permission to update this lead.')
  }

  const before = lead.toObject()
  const previousStatus = lead.status

  // Prevent modifying leadId or createdBy
  delete req.body.leadId
  delete req.body.createdBy

  Object.assign(lead, req.body)
  await lead.save()

  // If status changed, record an activity
  if (req.body.status && req.body.status !== previousStatus) {
    await LeadActivity.create({
      lead: lead._id,
      activityType: 'status_change',
      performedBy: req.user._id,
      description: `Status changed from "${previousStatus}" to "${lead.status}"`,
      outcome: `Lead status updated to ${lead.status}`,
    })
  }

  await createAuditLog({
    actor: req.user,
    action: 'update',
    entityType: 'Lead',
    entityId: lead._id,
    before,
    after: lead.toObject(),
    req,
  })

  const updated = await Lead.findById(lead._id)
    .populate('assignedTo', 'fullName email mobile')
    .populate('createdBy', 'fullName email')

  return ApiResponse.ok(updated, 'Lead updated successfully').send(res)
})

export const assignLead = asyncHandler(async (req, res) => {
  const { newAssignedTo, reason } = req.body
  const lead = await Lead.findById(req.params.id)
  if (!lead) throw ApiError.notFound('Lead')

  const previousAssignee = lead.assignedTo
  lead.assignedTo = newAssignedTo
  await lead.save()

  // Deactivate old assignment records
  await LeadAssignment.updateMany({ lead: lead._id, isActive: true }, { isActive: false })

  // Create new assignment record
  await LeadAssignment.create({
    lead: lead._id,
    assignedTo: newAssignedTo,
    assignedBy: req.user._id,
    previousAssignee,
    reason: reason || 'Lead reassigned by manager',
  })

  // Record activity
  await LeadActivity.create({
    lead: lead._id,
    activityType: 'assignment_change',
    performedBy: req.user._id,
    description: `Lead assigned to new employee. Reason: ${reason || 'N/A'}`,
  })

  // Notify new assignee
  await Notification.create({
    recipient: newAssignedTo,
    type: 'lead_assigned',
    title: 'Lead Reassigned to You',
    message: `Lead ${lead.customerName} (${lead.leadId}) has been assigned to you.`,
    entityType: 'lead',
    entityId: lead._id,
  })

  await createAuditLog({
    actor: req.user,
    action: 'reassign',
    entityType: 'Lead',
    entityId: lead._id,
    before: { assignedTo: previousAssignee },
    after: { assignedTo: newAssignedTo, reason },
    req,
  })

  return ApiResponse.ok(lead, 'Lead assigned successfully').send(res)
})

export const getLeadActivities = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  if (!lead) throw ApiError.notFound('Lead')

  const perms = req.user.role?.permissions || []
  if (!perms.includes(PERMISSIONS.LEADS_VIEW_ALL) && String(lead.assignedTo) !== String(req.user._id)) {
    throw ApiError.forbidden('You do not have permission to view activities for this lead.')
  }

  const activities = await LeadActivity.find({ lead: req.params.id })
    .populate('performedBy', 'fullName designation profileImage')
    .sort({ date: -1 })

  return ApiResponse.ok(activities, 'Activities retrieved').send(res)
})

export const addLeadActivity = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  if (!lead) throw ApiError.notFound('Lead')

  const perms = req.user.role?.permissions || []
  if (!perms.includes(PERMISSIONS.LEADS_VIEW_ALL) && String(lead.assignedTo) !== String(req.user._id)) {
    throw ApiError.forbidden('You do not have permission to record activity on this lead.')
  }

  const activityDate = req.body.date || req.body.spokenDate || new Date()
  const activity = await LeadActivity.create({
    ...req.body,
    lead: lead._id,
    performedBy: req.user._id,
    date: activityDate,
  })

  // Update lead's lastContactDate & nextFollowUpDate if provided
  lead.lastContactDate = activityDate
  if (req.body.nextFollowUpDate) {
    lead.nextFollowUpDate = req.body.nextFollowUpDate
  }
  if (req.body.nextFollowUpTime) {
    lead.nextFollowUpTime = req.body.nextFollowUpTime
  }
  await lead.save()

  const populated = await LeadActivity.findById(activity._id).populate('performedBy', 'fullName designation')
  return ApiResponse.created(populated, 'Activity recorded').send(res)
})

export const getLeadStats = asyncHandler(async (req, res) => {
  const scope = getLeadQueryScope(req.user)
  const base = { ...scope, isArchived: false }

  const todayStart = dayjs().startOf('day').toDate()
  const todayEnd = dayjs().endOf('day').toDate()

  const [
    total,
    newLeads,
    hotLeads,
    warmLeads,
    coldLeads,
    convertedLeads,
    lostLeads,
    followupsDueToday,
    overdueFollowups,
  ] = await Promise.all([
    Lead.countDocuments(base),
    Lead.countDocuments({ ...base, status: 'new' }),
    Lead.countDocuments({ ...base, leadTemperature: 'hot' }),
    Lead.countDocuments({ ...base, leadTemperature: 'warm' }),
    Lead.countDocuments({ ...base, leadTemperature: 'cold' }),
    Lead.countDocuments({ ...base, status: 'converted' }),
    Lead.countDocuments({ ...base, status: 'lost' }),
    Lead.countDocuments({ ...base, nextFollowUpDate: { $gte: todayStart, $lte: todayEnd } }),
    Lead.countDocuments({ ...base, nextFollowUpDate: { $lt: todayStart }, status: { $nin: ['converted', 'lost'] } }),
  ])

  return ApiResponse.ok({
    total,
    newLeads,
    hotLeads,
    warmLeads,
    coldLeads,
    convertedLeads,
    lostLeads,
    followupsDueToday,
    overdueFollowups,
  }, 'Lead stats retrieved').send(res)
})

export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
  if (!lead) throw ApiError.notFound('Lead')

  const perms = req.user.role?.permissions || []
  const canDelete =
    perms.includes(PERMISSIONS.LEADS_DELETE) ||
    perms.includes(PERMISSIONS.LEADS_VIEW_ALL) ||
    req.user.role?.name === 'super_admin' ||
    req.user.role?.name === 'admin'

  if (!canDelete) {
    throw ApiError.forbidden('You do not have permission to delete leads.')
  }

  const before = lead.toObject()

  await Promise.all([
    Lead.findByIdAndDelete(req.params.id),
    LeadActivity.deleteMany({ lead: req.params.id }),
    LeadAssignment.deleteMany({ lead: req.params.id }),
  ])

  await createAuditLog({
    actor: req.user,
    action: 'delete',
    entityType: 'Lead',
    entityId: lead._id,
    before,
    req,
  })

  return ApiResponse.ok(null, 'Lead deleted successfully').send(res)
})

export const bulkAssignLeads = asyncHandler(async (req, res) => {
  const { leadIds, assignedTo, reason } = req.body
  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    throw ApiError.badRequest('leadIds must be a non-empty array')
  }

  await Lead.updateMany(
    { _id: { $in: leadIds } },
    { $set: { assignedTo } }
  )

  const assignmentDocs = leadIds.map(leadId => ({
    lead: leadId,
    assignedTo,
    assignedBy: req.user._id,
    reason: reason || 'Bulk assignment',
  }))
  await LeadAssignment.insertMany(assignmentDocs)

  await Notification.create({
    recipient: assignedTo,
    type: 'lead_assigned',
    title: 'Multiple Leads Assigned',
    message: `${leadIds.length} leads have been assigned to you.`,
    entityType: 'lead',
  })

  return ApiResponse.ok({ count: leadIds.length }, `${leadIds.length} leads assigned successfully`).send(res)
})

