import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { env } from '../config/environment.js'

// In-memory user cache to eliminate redundant DB lookups on consecutive requests
const userCache = new Map()
const USER_CACHE_TTL = 60 * 1000 // 60 seconds

export const invalidateUserCache = (userId) => {
  if (userId) {
    userCache.delete(String(userId))
  } else {
    userCache.clear()
  }
}

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

  const userId = decoded.userId
  const now = Date.now()
  const cached = userCache.get(userId)

  let user
  if (cached && cached.expiry > now) {
    user = cached.user
  } else {
    user = await User.findById(userId)
      .populate('role', 'name displayName permissions department')
      .lean()

    if (user) {
      userCache.set(userId, { user, expiry: now + USER_CACHE_TTL })
      if (userCache.size > 2000) {
        const firstKey = userCache.keys().next().value
        userCache.delete(firstKey)
      }
    }
  }

  if (!user) throw ApiError.unauthorized('Account no longer exists.')
  if (user.accountStatus !== 'active') {
    userCache.delete(userId)
    throw ApiError.forbidden('Your account has been deactivated. Contact your administrator.')
  }

  req.user = user
  next()
})

