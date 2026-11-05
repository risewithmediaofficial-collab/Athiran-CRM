import mongoose from 'mongoose'

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: {
    type: String,
    enum: ['login', 'logout', 'login_failed', 'create', 'update', 'delete', 'archive', 'assign', 'reassign', 'approve', 'reject', 'handover', 'permission_change', 'password_reset', 'account_status_change'],
    required: true,
  },
  entityType: String,
  entityId: mongoose.Schema.Types.ObjectId,
  before: mongoose.Schema.Types.Mixed,
  after: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false })

// Audit logs are append-only — no updates allowed
auditLogSchema.index({ actor: 1, timestamp: -1 })
auditLogSchema.index({ entityType: 1, entityId: 1 })
auditLogSchema.index({ timestamp: -1 })
auditLogSchema.index({ action: 1 })

export const AuditLog = mongoose.model('AuditLog', auditLogSchema)

