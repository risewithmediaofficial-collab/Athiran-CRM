import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { User } from '../models/User.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { env } from '../config/environment.js'
import { createAuditLog } from '../middleware/auditLogger.js'

// ─── Constants ──────────────────────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutes
const MAX_REFRESH_TOKENS = 5

// ─── Helpers ─────────────────────────────────────────────────────────────────
const generateAccessToken = (user) =>
  jwt.sign(
    { userId: user._id, username: user.username, role: user.role?.name },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  )

const generateRefreshToken = (user) =>
  jwt.sign(
    { userId: user._id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  )

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
  })
}

// ─── login ───────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body

  // Find user (case-insensitive username) and select sensitive fields
  const user = await User.findOne({ username: username.toLowerCase() })
    .select('+passwordHash +loginAttempts +lockUntil +refreshTokens')
    .populate('role', 'name displayName permissions department')

  if (!user) {
    throw ApiError.unauthorized('Invalid username or password')
  }

  // Check account status
  if (user.accountStatus !== 'active') {
    throw ApiError.forbidden('Your account is not active. Please contact your administrator.')
  }

  // Check lockout
  if (user.lockUntil && user.lockUntil > new Date()) {
    const remaining = Math.ceil((user.lockUntil - Date.now()) / 60000)
    throw ApiError.unauthorized(
      `Account is temporarily locked. Try again in ${remaining} minute(s).`
    )
  }

  // Verify password
  const isMatch = await argon2.verify(user.passwordHash, password)

  if (!isMatch) {
    // Increment failed attempts
    user.loginAttempts = (user.loginAttempts || 0) + 1

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS)
      user.loginAttempts = 0
      await user.save()
      throw ApiError.unauthorized(
        'Too many failed attempts. Account locked for 15 minutes.'
      )
    }

    await user.save()
    throw ApiError.unauthorized('Invalid username or password')
  }

  // Generate tokens
  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)
  const hashedRefresh = await argon2.hash(refreshToken)

  // Store hashed refresh token atomically (avoid version conflict under concurrent logins)
  await User.findByIdAndUpdate(user._id, {
    loginAttempts: 0,
    $unset: { lockUntil: 1 },
    lastLogin: new Date(),
    $push: {
      refreshTokens: {
        $each: [hashedRefresh],
        $slice: -MAX_REFRESH_TOKENS,
      },
    },
  })

  setRefreshCookie(res, refreshToken)

  await createAuditLog({
    actor: user._id,
    action: 'login',
    entityType: 'User',
    entityId: user._id,
    after: { lastLogin: user.lastLogin },
    req,
  })

  const userData = user.toJSON()

  ApiResponse.ok(
    { user: userData, accessToken },
    'Login successful'
  ).send(res)
})

// ─── logout ──────────────────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken

  if (incomingRefreshToken) {
    // Load user with refreshTokens
    const user = await User.findById(req.user._id).select('+refreshTokens')
    if (user) {
      // Remove the matching hashed token
      const filtered = []
      for (const hashed of user.refreshTokens || []) {
        try {
          const matches = await argon2.verify(hashed, incomingRefreshToken)
          if (!matches) filtered.push(hashed)
        } catch {
          // Malformed hash — discard
        }
      }
      user.refreshTokens = filtered
      await user.save()
    }
  }

  clearRefreshCookie(res)

  await createAuditLog({
    actor: req.user._id,
    action: 'logout',
    entityType: 'User',
    entityId: req.user._id,
    req,
  })

  ApiResponse.ok(null, 'Logged out successfully').send(res)
})

// ─── refreshToken ─────────────────────────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
  const incomingToken =
    req.cookies?.refreshToken || req.body?.refreshToken

  if (!incomingToken) {
    throw ApiError.unauthorized('Refresh token is required')
  }

  // Verify JWT signature and expiry
  let decoded
  try {
    decoded = jwt.verify(incomingToken, env.JWT_REFRESH_SECRET)
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token. Please log in again.')
  }

  // Load user with tokens
  const user = await User.findById(decoded.userId)
    .select('+refreshTokens')
    .populate('role', 'name displayName permissions department')

  if (!user) throw ApiError.unauthorized('Account no longer exists.')
  if (user.accountStatus !== 'active') {
    throw ApiError.forbidden('Your account has been deactivated.')
  }

  // Find matching hashed token in array
  let matchedIndex = -1
  for (let i = 0; i < (user.refreshTokens || []).length; i++) {
    try {
      const matches = await argon2.verify(user.refreshTokens[i], incomingToken)
      if (matches) { matchedIndex = i; break }
    } catch {
      // Skip malformed
    }
  }

  if (matchedIndex === -1) {
    // Possible token reuse — revoke all sessions
    user.refreshTokens = []
    await user.save()
    throw ApiError.unauthorized('Refresh token has already been used or revoked. Please log in again.')
  }

  // Rotate: remove old, add new
  const newAccessToken = generateAccessToken(user)
  const newRefreshToken = generateRefreshToken(user)
  const hashedNew = await argon2.hash(newRefreshToken)

  user.refreshTokens.splice(matchedIndex, 1)
  user.refreshTokens = [...user.refreshTokens, hashedNew].slice(-MAX_REFRESH_TOKENS)
  await user.save()

  setRefreshCookie(res, newRefreshToken)

  ApiResponse.ok(
    { accessToken: newAccessToken },
    'Token refreshed successfully'
  ).send(res)
})

// ─── getMe ───────────────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  // req.user is already populated with role (from authenticate middleware)
  ApiResponse.ok(req.user, 'Profile fetched successfully').send(res)
})

// ─── forgotPassword ──────────────────────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+passwordResetToken +passwordResetExpiry')

  // Always return success to prevent email enumeration
  if (!user) {
    return ApiResponse.ok(
      null,
      'If that email is registered, a reset link has been sent.'
    ).send(res)
  }

  // Generate a secure random token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  user.passwordResetToken = hashedToken
  user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
  await user.save()

  await createAuditLog({
    actor: user._id,
    action: 'AUTH_FORGOT_PASSWORD',
    entityType: 'User',
    entityId: user._id,
    req,
  })

  // In production: send email with resetToken
  // For now: return token in response with a note
  ApiResponse.ok(
    {
      resetToken,
      note: 'In production this token would be emailed. Store it securely.',
      expiresIn: '1 hour',
    },
    'Password reset token generated successfully'
  ).send(res)
})

// ─── resetPassword ────────────────────────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body

  // Hash the provided token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpiry +refreshTokens')

  if (!user) {
    throw ApiError.badRequest('Invalid or expired password reset token.')
  }

  // Hash new password
  user.passwordHash = await argon2.hash(newPassword)

  // Clear reset token fields
  user.passwordResetToken = undefined
  user.passwordResetExpiry = undefined

  // Force re-login everywhere by clearing all refresh tokens
  user.refreshTokens = []

  await user.save()

  await createAuditLog({
    actor: user._id,
    action: 'AUTH_RESET_PASSWORD',
    entityType: 'User',
    entityId: user._id,
    req,
  })

  ApiResponse.ok(null, 'Password reset successfully. Please log in with your new password.').send(res)
})
