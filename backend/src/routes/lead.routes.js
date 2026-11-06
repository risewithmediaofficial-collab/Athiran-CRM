import express from 'express'
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  assignLead,
  getLeadActivities,
  addLeadActivity,
  getLeadStats,
  bulkAssignLeads,
  deleteLead,
} from '../controllers/lead.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize, authorizeAny } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { body } from 'express-validator'
import { PERMISSIONS } from '../constants/permissions.js'

const router = express.Router()
router.use(authenticate)

router.get('/', getLeads)
router.get('/stats/summary', getLeadStats)

router.post(
  '/',
  authorize(PERMISSIONS.LEADS_CREATE),
  [
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('primaryMobile').trim().notEmpty().withMessage('Mobile number is required'),
    body('leadTemperature').isIn(['hot', 'warm', 'cold']).withMessage('Valid temperature is required'),
    body('leadSource').notEmpty().withMessage('Lead source is required'),
    body('leadDate').optional(),
  ],
  validate,
  createLead
)

router.post('/bulk/assign', authorize(PERMISSIONS.LEADS_ASSIGN), bulkAssignLeads)

router.get('/:id', getLeadById)
router.patch('/:id', updateLead)
router.delete('/:id', deleteLead)

router.post(
  '/:id/assign',
  authorizeAny(PERMISSIONS.LEADS_ASSIGN, PERMISSIONS.LEADS_REASSIGN, PERMISSIONS.LEADS_EDIT_ALL, PERMISSIONS.LEADS_VIEW_ALL),
  [body('newAssignedTo').notEmpty().withMessage('New assigned employee is required')],
  validate,
  assignLead
)

router.post(
  '/:id/reassign',
  authorizeAny(PERMISSIONS.LEADS_ASSIGN, PERMISSIONS.LEADS_REASSIGN, PERMISSIONS.LEADS_EDIT_ALL, PERMISSIONS.LEADS_VIEW_ALL),
  [body('newAssignedTo').notEmpty().withMessage('New assigned employee is required')],
  validate,
  assignLead
)

router.get('/:id/activities', getLeadActivities)
router.post(
  '/:id/activities',
  [
    body('activityType').notEmpty().withMessage('Activity type is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('date').optional(),
  ],
  validate,
  addLeadActivity
)

export default router

