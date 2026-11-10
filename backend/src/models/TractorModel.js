import mongoose from 'mongoose'

const tractorModelSchema = new mongoose.Schema(
  {
    modelCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
    modelName: { type: String, required: true, unique: true, trim: true },
    brand: { type: String, required: true, default: 'Massey Ferguson', trim: true },
    category: { type: String, required: true, trim: true },
    horsepower: { type: Number, required: true, min: 1 },
    hpDisplay: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    specs: {
      engine: { type: String, trim: true, default: '' },
      cylinders: { type: String, trim: true, default: '' },
      displacementCc: { type: String, trim: true, default: '' },
      transmission: { type: String, trim: true, default: '' },
      gears: { type: String, trim: true, default: '' },
      clutch: { type: String, trim: true, default: '' },
      pto: { type: String, trim: true, default: '' },
      liftingCapacity: { type: String, trim: true, default: '' },
      hydraulicsControl: { type: String, trim: true, default: '' },
      driveType: { type: String, trim: true, default: '2WD' },
      brakes: { type: String, trim: true, default: '' },
      steering: { type: String, trim: true, default: '' },
      emissionNorm: { type: String, trim: true, default: '' },
    },
    serviceIntervalHours: { type: Number, default: 250, min: 50 },
    sortOrder: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

tractorModelSchema.index({ isActive: 1, sortOrder: 1, horsepower: 1 })
tractorModelSchema.index({ category: 1 })
tractorModelSchema.index({ modelName: 'text', brand: 'text', category: 'text' })

export const TractorModel = mongoose.model('TractorModel', tractorModelSchema)

