import mongoose from 'mongoose'

const systemSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  category: { type: String, enum: ['dealership', 'leads', 'service', 'notifications', 'security'], required: true },
  label: String,
  description: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

export const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema)

