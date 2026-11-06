import mongoose from 'mongoose'

const followUpSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledDate: { type: Date, required: true },
  scheduledTime: String,
  type: { type: String, enum: ['call', 'whatsapp', 'visit', 'demo', 'meeting', 'other'], required: true },
  reminderMinutes: { type: Number, default: 30 },
  notes: String,
  expectedOutcome: String,
  status: { type: String, enum: ['pending', 'completed', 'missed', 'rescheduled', 'cancelled'], default: 'pending' },
  completedAt: Date,
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completionNotes: String,
  rescheduledTo: { type: mongoose.Schema.Types.ObjectId, ref: 'FollowUp' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

followUpSchema.index({ assignedTo: 1, scheduledDate: 1 })
followUpSchema.index({ lead: 1 })
followUpSchema.index({ status: 1 })
followUpSchema.index({ scheduledDate: 1, status: 1 })

export const FollowUp = mongoose.model('FollowUp', followUpSchema)

