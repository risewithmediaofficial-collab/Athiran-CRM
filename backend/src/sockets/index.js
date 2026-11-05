import { logger } from '../utils/logger.js'

export const initSocketIO = (io) => {
  // Per-user rooms for targeted notifications
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId
    if (userId) {
      socket.join(`user:${userId}`)
      logger.info(`Socket connected: user:${userId} [${socket.id}]`)
    }

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`)
    })
  })
}

/**
 * Send a real-time notification to a specific user.
 * @param {object} io - Socket.IO server instance
 * @param {string} userId - Recipient user ID
 * @param {string} event - Event name
 * @param {object} payload - Event data
 */
export const emitToUser = (io, userId, event, payload) => {
  io.to(`user:${userId}`).emit(event, payload)
}

