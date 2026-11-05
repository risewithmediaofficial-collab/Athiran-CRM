import { AuditLog } from '../models/AuditLog.js'
import { logger } from '../utils/logger.js'

/**
 * Create an audit log entry.
 * @param {object} options
 */
export const createAuditLog = async ({ actor, action, entityType, entityId, before, after, req }) => {
  try {
    // Sanitize — never log password fields
    const sanitize = (obj) => {
      if (!obj) return obj
      const clone = { ...obj }
      delete clone.passwordHash
      delete clone.refreshTokens
      delete clone.passwordResetToken
      return clone
    }

    await AuditLog.create({
      actor: actor?._id || actor,
      action,
      entityType,
      entityId,
      before: sanitize(before),
      after: sanitize(after),
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
      timestamp: new Date(),
    })
  } catch (err) {
    logger.error('Audit log creation failed:', err.message)
    // Never throw — audit failures should not break the main operation
  }
}

