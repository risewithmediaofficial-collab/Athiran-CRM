import mongoose from 'mongoose'

const ROLES = ['super_admin', 'admin', 'sales_manager', 'sales_executive', 'telecaller', 'service_manager', 'service_advisor', 'service_technician']

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, enum: ROLES },
  displayName: { type: String, required: true },
  permissions: [{ type: String }],
  department: { type: String, enum: ['admin', 'sales', 'service', 'management'] },
  isSystem: { type: Boolean, default: false },
}, { timestamps: true })

export const Role = mongoose.model('Role', roleSchema)
export { ROLES }

