import express from 'express'
import { body } from 'express-validator'
import { login, logout, refreshToken, getMe, forgotPassword, resetPassword } from '../controllers/auth.controller.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

router.post('/login', authLimiter,
  [body('username').trim().notEmpty(), body('password').notEmpty()],
  validate, login)
router.post('/logout', authenticate, logout)
router.post('/refresh', refreshToken)
router.get('/me', authenticate, getMe)
router.post('/forgot-password', authLimiter,
  [body('email').isEmail()], validate, forgotPassword)
router.post('/reset-password', authLimiter,
  [body('token').notEmpty(), body('newPassword').isLength({ min: 8 })], validate, resetPassword)

export default router
