import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import { corsOptions } from './config/cors.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { logger } from './utils/logger.js'
import { env } from './config/environment.js'

// Route imports
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import roleRoutes from './routes/role.routes.js'
import leadRoutes from './routes/lead.routes.js'
import followupRoutes from './routes/followup.routes.js'
import assignmentRoutes from './routes/assignment.routes.js'
import customerRoutes from './routes/customer.routes.js'
import tractorRoutes from './routes/tractor.routes.js'
import serviceRoutes from './routes/service.routes.js'
import leaveRoutes from './routes/leave.routes.js'
import reportRoutes from './routes/report.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import settingsRoutes from './routes/settings.routes.js'

const app = express()

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors(corsOptions))

// ── Compression (Gzip / Deflate for all API responses > 1KB) ──────────────────
app.use(compression({
  threshold: 1024,
  level: 6,
}))

// ── Trust proxy (for rate-limiter, behind nginx/load balancer) ────────────────
app.set('trust proxy', 1)

// ── Request parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
  skip: (req) => req.url === '/api/v1/health' || req.url.startsWith('/uploads'),
}))

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use(`/api/${env.API_VERSION}`, generalLimiter)

// ── Health check ──────────────────────────────────────────────────────────────
app.get(`/api/${env.API_VERSION}/health`, (req, res) => {
  res.json({ success: true, message: 'Athiran Motors CRM API is running', timestamp: new Date().toISOString() })
})

// ── API Routes ────────────────────────────────────────────────────────────────
const BASE = `/api/${env.API_VERSION}`
app.use(`${BASE}/auth`, authRoutes)
app.use(`${BASE}/users`, userRoutes)
app.use(`${BASE}/roles`, roleRoutes)
app.use(`${BASE}/leads`, leadRoutes)
app.use(`${BASE}/followups`, followupRoutes)
app.use(`${BASE}/assignments`, assignmentRoutes)
app.use(`${BASE}/customers`, customerRoutes)
app.use(`${BASE}/tractors`, tractorRoutes)
app.use(`${BASE}/services`, serviceRoutes)
app.use(`${BASE}/leave`, leaveRoutes)
app.use(`${BASE}/reports`, reportRoutes)
app.use(`${BASE}/notifications`, notificationRoutes)
app.use(`${BASE}/settings`, settingsRoutes)

// ── Serve uploaded files (with caching headers) ──────────────────────────────
app.use('/uploads', express.static('uploads', {
  maxAge: '7d',
  etag: true,
  immutable: false,
}))

// ── 404 & Error handler ───────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app

