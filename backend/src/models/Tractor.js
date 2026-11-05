import mongoose from 'mongoose'

const tractorSchema = new mongoose.Schema({
  tractorId: { type: String, unique: true, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  registrationNumber: { type: String, trim: true },
  modelName: { type: String, required: true },
  brand: { type: String, required: true },
  horsepower: Number,
  chassisNumber: { type: String, unique: true, sparse: true },
  engineNumber: { type: String, unique: true, sparse: true },
  purchaseDate: Date,
  warrantyStart: Date,
  warrantyEnd: Date,
  dealerPurchaseLocation: String,
  currentEngineHours: { type: Number, default: 0, min: 0 },
  lastRecordedEngineHours: { type: Number, default: 0 },
  lastReadingDate: Date,
  estimatedDailyHours: { type: Number, default: 5, min: 0 },
  serviceIntervalHours: { type: Number, default: 250, min: 1 },
  lastServiceHours: { type: Number, default: 0 },
  lastServiceDate: Date,
  nextServiceTargetHours: Number,
  nextServiceEstimatedDate: Date,
  tractorStatus: { type: String, enum: ['active', 'warranty', 'sold', 'scrapped'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

tractorSchema.virtual('model').get(function() { return this.modelName })

tractorSchema.index({ customer: 1 })
tractorSchema.index({ registrationNumber: 1 })
tractorSchema.index({ nextServiceTargetHours: 1 })
tractorSchema.index({ nextServiceEstimatedDate: 1 })
tractorSchema.index({ registrationNumber: 'text', chassisNumber: 'text', engineNumber: 'text', modelName: 'text' })

export const Tractor = mongoose.model('Tractor', tractorSchema)

