import rateLimit from 'express-rate-limit'
import { env } from '../config/environment.js'

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.IS_DEVELOPMENT ? 50000 : env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => env.IS_DEVELOPMENT,
  message: { 
    success: false, 
    error: { 
      code: 'RATE_LIMITED', 
      message: 'Too many requests. Please try again later.' 
    } 
  },
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: env.IS_DEVELOPMENT ? 50000 : env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => env.IS_DEVELOPMENT,
  skipSuccessfulRequests: true,
  message: { 
    success: false, 
    error: { 
      code: 'RATE_LIMITED', 
      message: 'Too many login attempts. Please try again in 15 minutes.' 
    } 
  },
})
