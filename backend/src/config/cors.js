import { env } from './environment.js'

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman, mobile)
    if (!origin) {
      return callback(null, true)
    }

    // Always allow any origin accessing the application (VPS IP, domain, localhost)
    // Returning true reflects the request origin and allows credentials (cookies, Bearer tokens)
    return callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count'],
  optionsSuccessStatus: 200,
}
