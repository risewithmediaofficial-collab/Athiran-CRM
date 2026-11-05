import express from 'express'
import {
  getLeaves,
  applyLeave,
  getLeaveById,
  approveLeave,
  rejectLeave,
  handoverLeads,
  getLeaveCalendar,
  deleteLeave,
} from '../controllers/leave.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { body } from 'express-validator'
import { PERMISSIONS } from '../constants/permissions.js'

const router = express.Router()
router.use(authenticate)

router.get('/', getLeaves)
router.get('/calendar', getLeaveCalendar)

router.post(
  '/',
  [
    body('leaveType').notEmpty().withMessage('Leave type is required'),
    body('startDate').isISO8601().withMessage('Start date is required'),
    body('endDate').isISO8601().withMessage('End date is required'),
    body('reason').trim().notEmpty().withMessage('Reason is required'),
  ],
  validate,
  applyLeave
)

router.get('/:id', getLeaveById)
router.patch('/:id/approve', authorize(PERMISSIONS.LEAVE_APPROVE), approveLeave)
router.patch('/:id/reject', authorize(PERMISSIONS.LEAVE_REJECT), rejectLeave)
router.post('/:id/handover', authorize(PERMISSIONS.LEAVE_MANAGE_HANDOVER), handoverLeads)
router.delete('/:id', deleteLeave)

export default router
