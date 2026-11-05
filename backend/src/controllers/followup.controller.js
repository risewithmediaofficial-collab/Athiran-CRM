import { FollowUp } from '../models/FollowUp.js'
import { Lead } from '../models/Lead.js'
import { LeadActivity } from '../models/LeadActivity.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse, paginated } from '../utils/ApiResponse.js'
import { ApiError } from '../utils/ApiError.js'
import { getPagination, buildPaginationMeta } from '../utils/pagination.js'
import { PERMISSIONS } from '../constants/permissions.js'
import dayjs from 'dayjs'

const getFollowupScope = (user) => {
  const perms = user.role?.permissions || []
  if (perms.includes(PERMISSIONS.FOLLOWUPS_VIEW_ALL)) {
    return {}
  }
  return { assignedTo: user._id }
}

export const getFollowUps = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPagination(req.query)
  const baseScope = getFollowupScope(req.user)
  const filter = { ...baseScope }

  if (req.query.status) filter.status = req.query.status
  if (req.query.lead) filter.lead = req.query.lead
  if (req.query.type) filter.type = req.query.type

  if (req.query.filterRange === 'today') {
    filter.scheduledDate = {
      $gte: dayjs().startOf('day').toDate(),
      $lte: dayjs().endOf('day').toDate(),
    }
  } else if (req.query.filterRange === 'overdue') {
    filter.scheduledDate = { $lt: dayjs().startOf('day').toDate() }
    filter.status = 'pending'
  }

  const [followups, total] = await Promise.all([
    FollowUp.find(filter)
      .populate('lead', 'leadId customerName primaryMobile tractorModelInterested status')
      .populate('assignedTo', 'fullName mobile')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    FollowUp.countDocuments(filter),
  ])

  return paginated(res, followups, buildPaginationMeta(page, limit, total), 'Follow-ups retrieved')
})

export const createFollowUp = asyncHandler(async (req, res) => {
  const { lead, scheduledDate, scheduledTime, type, notes, expectedOutcome } = req.body

  const leadDoc = await Lead.findById(lead)
  if (!leadDoc) throw ApiError.notFound('Lead')

  const followup = await FollowUp.create({
    lead,
    assignedTo: req.body.assignedTo || leadDoc.assignedTo || req.user._id,
    scheduledDate: new Date(scheduledDate),
    scheduledTime,
    type,
    notes,
    expectedOutcome,
    createdBy: req.user._id,
  })

  // Update lead next follow up
  leadDoc.nextFollowUpDate = new Date(scheduledDate)
  leadDoc.nextFollowUpTime = scheduledTime
  await leadDoc.save()

  // Log activity
  await LeadActivity.create({
    lead: leadDoc._id,
    activityType: 'note',
    performedBy: req.user._id,
    description: `Scheduled ${type} follow-up for ${dayjs(scheduledDate).format('DD MMM YYYY')} ${scheduledTime || ''}`,
    nextAction: expectedOutcome,
    nextFollowUpDate: new Date(scheduledDate),
  })

  const populated = await FollowUp.findById(followup._id)
    .populate('lead', 'leadId customerName primaryMobile')
    .populate('assignedTo', 'fullName')

  return ApiResponse.created(populated, 'Follow-up scheduled successfully').send(res)
})

export const getFollowUpById = asyncHandler(async (req, res) => {
  const followup = await FollowUp.findById(req.params.id)
    .populate('lead')
    .populate('assignedTo', 'fullName mobile')

  if (!followup) throw ApiError.notFound('FollowUp')
  return ApiResponse.ok(followup, 'Follow-up retrieved').send(res)
})

export const updateFollowUp = asyncHandler(async (req, res) => {
  const followup = await FollowUp.findById(req.params.id)
  if (!followup) throw ApiError.notFound('FollowUp')

  Object.assign(followup, req.body)
  await followup.save()

  const updated = await FollowUp.findById(followup._id)
    .populate('lead', 'customerName primaryMobile leadId')
    .populate('assignedTo', 'fullName')

  return ApiResponse.ok(updated, 'Follow-up updated').send(res)
})

export const completeFollowUp = asyncHandler(async (req, res) => {
  const { completionNotes, nextFollowUpDate, nextFollowUpTime } = req.body
  const followup = await FollowUp.findById(req.params.id).populate('lead')
  if (!followup) throw ApiError.notFound('FollowUp')

  followup.status = 'completed'
  followup.completedAt = new Date()
  followup.completionNotes = completionNotes
  await followup.save()

  // Log activity on lead
  if (followup.lead) {
    await LeadActivity.create({
      lead: followup.lead._id,
      activityType: followup.type === 'call' ? 'outgoing_call' : 'customer_visit',
      performedBy: req.user._id,
      description: `Completed scheduled follow-up: ${followup.notes || ''}`,
      outcome: completionNotes,
      ...(nextFollowUpDate && { nextFollowUpDate: new Date(nextFollowUpDate) }),
    })

    if (nextFollowUpDate) {
      followup.lead.nextFollowUpDate = new Date(nextFollowUpDate)
      followup.lead.nextFollowUpTime = nextFollowUpTime
      await followup.lead.save()
    }
  }

  return ApiResponse.ok(followup, 'Follow-up marked as completed').send(res)
})

export const deleteFollowUp = asyncHandler(async (req, res) => {
  const followup = await FollowUp.findById(req.params.id)
  if (!followup) throw ApiError.notFound('FollowUp')

  await FollowUp.findByIdAndDelete(req.params.id)
  return ApiResponse.ok(null, 'Follow-up deleted').send(res)
})
