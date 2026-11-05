import mongoose from 'mongoose'

const NOTIFICATION_TYPES = [
  'lead_assigned', 'lead_reassigned', 'followup_due', 'followup_overdue',
  'leave_submitted', 'leave_approved', 'leave_rejected',
  'service_due', 'service_overdue', 'service_completed', 'new_service_assigned',
  'handover_completed', 'general',
]

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: NOTIFICATION_TYPES, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  entityType: { type: String, enum: ['lead', 'service', 'leave', 'followup', 'assignment', 'general'] },
  entityId: mongoose.Schema.Types.ObjectId,
  isRead: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: true })

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, createdAt: -1 })

export const Notification = mongoose.model('Notification', notificationSchema)

