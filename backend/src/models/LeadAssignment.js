import mongoose from 'mongoose'

const leadAssignmentSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAt: { type: Date, default: Date.now },
  reason: String,
  previousAssignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

leadAssignmentSchema.index({ lead: 1, isActive: 1 })
leadAssignmentSchema.index({ assignedTo: 1 })

export const LeadAssignment = mongoose.model('LeadAssignment', leadAssignmentSchema)

