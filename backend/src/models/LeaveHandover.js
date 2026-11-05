import mongoose from 'mongoose'

const leaveHandoverSchema = new mongoose.Schema({
  leaveRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveRequest', required: true },
  originalEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coveringEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  handoverType: { type: String, enum: ['admin_handles', 'reassign'], required: true },
  leadsHandedOver: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lead' }],
  followUpsTransferred: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FollowUp' }],
  handoverSummary: String,
  handoverDate: { type: Date, default: Date.now },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })

export const LeaveHandover = mongoose.model('LeaveHandover', leaveHandoverSchema)

