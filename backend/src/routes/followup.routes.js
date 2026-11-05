import express from 'express'
import {
  getFollowUps,
  createFollowUp,
  getFollowUpById,
  updateFollowUp,
  completeFollowUp,
  deleteFollowUp,
} from '../controllers/followup.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'
import { body } from 'express-validator'

const router = express.Router()
router.use(authenticate)

router.get('/', getFollowUps)

router.post(
  '/',
  [
    body('lead').notEmpty().withMessage('Lead reference is required'),
    body('scheduledDate').isISO8601().withMessage('Scheduled date is required'),
    body('type').isIn(['call', 'whatsapp', 'visit', 'demo', 'meeting', 'other']),
  ],
  validate,
  createFollowUp
)

router.get('/:id', getFollowUpById)
router.patch('/:id', updateFollowUp)
router.post('/:id/complete', completeFollowUp)
router.delete('/:id', deleteFollowUp)

export default router
