import mongoose from 'mongoose'

const leaveRequestSchema = new mongoose.Schema({
  leaveId: { type: String, unique: true, required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { type: String, enum: ['casual', 'sick', 'emergency', 'personal', 'other'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  numberOfDays: { type: Number, required: true, min: 0.5 },
  reason: { type: String, required: true },
  attachment: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  rejectionReason: String,
  handoverOption: { type: String, enum: ['admin_handles', 'reassign', 'pending'], default: 'pending' },
  handoverRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveHandover' },
  submittedAt: { type: Date, default: Date.now },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

leaveRequestSchema.virtual('user').get(function() { return this.employee })

leaveRequestSchema.index({ employee: 1, status: 1 })
leaveRequestSchema.index({ status: 1, startDate: 1 })

export const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema)

