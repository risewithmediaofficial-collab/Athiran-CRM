import mongoose from 'mongoose'

const ACTIVITY_TYPES = ['incoming_call', 'outgoing_call', 'whatsapp', 'sms', 'customer_visit', 'showroom_visit', 'demo', 'meeting', 'negotiation', 'status_change', 'assignment_change', 'note', 'other']

const leadActivitySchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  activityType: { type: String, enum: ACTIVITY_TYPES, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true },
  outcome: String,
  nextAction: String,
  nextFollowUpDate: Date,
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true })

leadActivitySchema.index({ lead: 1, date: -1 })
leadActivitySchema.index({ performedBy: 1 })

export const LeadActivity = mongoose.model('LeadActivity', leadActivitySchema)

