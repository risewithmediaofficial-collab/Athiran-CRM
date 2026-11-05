import { logger } from '../utils/logger.js'
import { ApiError } from '../utils/ApiError.js'
import { env } from '../config/environment.js'

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'An unexpected error occurred'
  let code = err.code || 'INTERNAL_ERROR'
  let errors = err.errors || []

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 422
    code = 'VALIDATION_ERROR'
    message = 'Validation failed'
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }))
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409
    code = 'CONFLICT'
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    message = `A record with this ${field} already exists.`
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400
    code = 'INVALID_ID'
    message = 'Invalid resource identifier.'
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    code = 'UNAUTHORIZED'
    message = 'Invalid token.'
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    code = 'TOKEN_EXPIRED'
    message = 'Session expired. Please log in again.'
  }

  // Log internal errors with stack
  if (statusCode >= 500) {
    logger.error(`[${code}] ${message}`, { stack: err.stack, path: req.path })
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: env.IS_PRODUCTION && statusCode >= 500 ? 'An unexpected error occurred' : message,
      ...(errors.length > 0 && { errors }),
      ...(env.IS_DEVELOPMENT && statusCode >= 500 && { stack: err.stack }),
    },
  })
}

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`, 'NOT_FOUND'))
}

