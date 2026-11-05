import { env } from './environment.js'

export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
    ]

    // Allow requests with no origin (mobile apps, curl, Postman in dev)
    if (!origin) {
      return callback(null, true)
    }

    // In development, allow any localhost/127.0.0.1 port
    const isLocalhost =
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')

    if (env.IS_DEVELOPMENT && isLocalhost) {
      return callback(null, true)
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    callback(new Error(`CORS: Origin ${origin} not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  optionsSuccessStatus: 200,
}

