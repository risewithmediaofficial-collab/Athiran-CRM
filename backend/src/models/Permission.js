import mongoose from 'mongoose'

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['leads', 'followups', 'employees', 'leave', 'service', 'customers', 'tractors', 'reports', 'audit', 'settings', 'rbac', 'notifications'],
  },
}, { timestamps: true })

export const Permission = mongoose.model('Permission', permissionSchema)

