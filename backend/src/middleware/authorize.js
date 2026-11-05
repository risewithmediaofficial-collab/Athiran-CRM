import { ApiError } from '../utils/ApiError.js'

/**
 * Middleware factory — checks if the authenticated user has ALL the given permissions.
 * @param {...string} requiredPermissions
 */
export const authorize = (...requiredPermissions) => (req, res, next) => {
  if (!req.user) throw ApiError.unauthorized()

  const userPermissions = req.user.role?.permissions || []

  const hasAll = requiredPermissions.every((p) => userPermissions.includes(p))
  if (!hasAll) {
    throw ApiError.forbidden(
      'You do not have the required permissions to perform this action.'
    )
  }
  next()
}

/**
 * Middleware — allows if user has ANY of the given permissions.
 */
export const authorizeAny = (...requiredPermissions) => (req, res, next) => {
  if (!req.user) throw ApiError.unauthorized()

  const userPermissions = req.user.role?.permissions || []

  const hasAny = requiredPermissions.some((p) => userPermissions.includes(p))
  if (!hasAny) {
    throw ApiError.forbidden('You do not have permission to access this resource.')
  }
  next()
}

