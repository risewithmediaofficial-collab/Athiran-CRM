import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import app from './app.js'
import { connectDB } from './config/database.js'
import { env } from './config/environment.js'
import { logger } from './utils/logger.js'
import { initSocketIO } from './sockets/index.js'
import { initJobs } from './jobs/index.js'

const httpServer = createServer(app)

// Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || (env.IS_DEVELOPMENT && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')))) {
        return callback(null, true)
      }
      callback(null, [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'].includes(origin))
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Make io accessible in controllers via app.set
app.set('io', io)

const start = async () => {
  try {
    await connectDB()

    initSocketIO(io)
    initJobs()

    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 Athiran Motors CRM API running on port ${env.PORT} [${env.NODE_ENV}]`)
      logger.info(`📡 Health check: http://localhost:${env.PORT}/api/${env.API_VERSION}/health`)
    })
  } catch (err) {
    logger.error('Server startup failed:', err)
    process.exit(1)
  }
}

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully`)
  httpServer.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason)
})

start()

