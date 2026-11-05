import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { env } from '../config/environment.js'

export const authenticate = asyncHandler(async (req, res, next) => {
  let token

  // 1. Try Authorization header (Bearer token)
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7)
  }

  // 2. Fall back to cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken
  }

  if (!token) throw ApiError.unauthorized()

  let decoded
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)
  } catch {
    throw ApiError.unauthorized('Invalid or expired token. Please log in again.')
  }

  const user = await User.findById(decoded.userId).populate('role', 'name displayName permissions department')

  if (!user) throw ApiError.unauthorized('Account no longer exists.')
  if (user.accountStatus !== 'active') throw ApiError.forbidden('Your account has been deactivated. Contact your administrator.')

  req.user = user
  next()
})

