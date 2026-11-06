import express from 'express'
import { getUsers, createUser, getUserById, updateUser, updateUserStatus, resetUserPassword, getUserPerformance, deleteUser } from '../controllers/user.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize, authorizeAny } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { body, param } from 'express-validator'
import { PERMISSIONS } from '../constants/permissions.js'

const router = express.Router()
router.use(authenticate)

router.get('/', authorizeAny(
  PERMISSIONS.EMPLOYEES_VIEW_ALL,
  PERMISSIONS.LEADS_ASSIGN,
  PERMISSIONS.LEADS_CREATE,
  PERMISSIONS.LEADS_VIEW_ALL,
  PERMISSIONS.FOLLOWUPS_VIEW_ALL
), getUsers)
router.post('/', authorize(PERMISSIONS.EMPLOYEES_CREATE),
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').notEmpty().withMessage('Role selection is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('designation').trim().notEmpty().withMessage('Designation is required'),
    body('mobile').trim().notEmpty().withMessage('Mobile number is required'),
    body('joiningDate').optional(),
  ],
  validate, createUser)
router.get('/:id', authorize(PERMISSIONS.EMPLOYEES_VIEW_PROFILE), getUserById)
router.patch('/:id', authorize(PERMISSIONS.EMPLOYEES_EDIT), updateUser)
router.patch('/:id/status', authorize(PERMISSIONS.EMPLOYEES_DEACTIVATE),
  [body('accountStatus').isIn(['active', 'inactive', 'suspended'])], validate, updateUserStatus)
router.post('/:id/reset-password', authorize(PERMISSIONS.EMPLOYEES_RESET_PASSWORD),
  [body('newPassword').isLength({ min: 8 })], validate, resetUserPassword)
router.get('/:id/performance', getUserPerformance)
router.delete('/:id', authorize(PERMISSIONS.EMPLOYEES_DEACTIVATE), deleteUser)

export default router
