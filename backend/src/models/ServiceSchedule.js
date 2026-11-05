import mongoose from 'mongoose'

const serviceScheduleSchema = new mongoose.Schema({
  tractor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tractor', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  scheduledDate: Date,
  targetHours: Number,
  type: { type: String, enum: ['hour_based', 'calendar_based', 'manual'], required: true },
  reminderThreshold: Number,
  status: { type: String, enum: ['upcoming', 'due_soon', 'overdue', 'completed', 'cancelled'], default: 'upcoming' },
  alertSent: { type: Boolean, default: false },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
}, { timestamps: true })

serviceScheduleSchema.index({ tractor: 1 })
serviceScheduleSchema.index({ scheduledDate: 1, status: 1 })
serviceScheduleSchema.index({ status: 1 })

export const ServiceSchedule = mongoose.model('ServiceSchedule', serviceScheduleSchema)

