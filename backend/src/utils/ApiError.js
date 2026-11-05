export class ApiError extends Error {
  constructor(statusCode, message, code, errors = []) {
    super(message)
    this.statusCode = statusCode
    this.code = code || this._codeFromStatus(statusCode)
    this.errors = errors
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }

  _codeFromStatus(status) {
    const map = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_ERROR',
    }
    return map[status] || 'API_ERROR'
  }

  static badRequest(message, code) { return new ApiError(400, message, code) }
  static unauthorized(message = 'Authentication required') { return new ApiError(401, message, 'UNAUTHORIZED') }
  static forbidden(message = 'You do not have permission to perform this action') { return new ApiError(403, message, 'FORBIDDEN') }
  static notFound(resource = 'Resource') { return new ApiError(404, `${resource} not found`, 'NOT_FOUND') }
  static conflict(message) { return new ApiError(409, message, 'CONFLICT') }
  static validation(errors) { return new ApiError(422, 'Validation failed', 'VALIDATION_ERROR', errors) }
  static internal(message = 'An unexpected error occurred') { return new ApiError(500, message, 'INTERNAL_ERROR') }
}

