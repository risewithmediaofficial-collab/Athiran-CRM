import mongoose from 'mongoose'

const meterReadingSchema = new mongoose.Schema({
  tractor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tractor', required: true },
  readingHours: { type: Number, required: true, min: 0 },
  readingDate: { type: Date, required: true, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: String,
  isCorrection: { type: Boolean, default: false },
  correctionReason: String,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

meterReadingSchema.index({ tractor: 1, readingDate: -1 })

export const MeterReading = mongoose.model('MeterReading', meterReadingSchema)

