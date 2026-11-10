import express from 'express'
import {
  getServices,
  createService,
  getServiceById,
  updateService,
  deleteService,
  getServiceDashboardStats,
  getServiceCalendar,
} from '../controllers/service.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'
import { body } from 'express-validator'

const router = express.Router()
router.use(authenticate)

router.get('/', getServices)
router.get('/dashboard/stats', getServiceDashboardStats)
router.get('/calendar', getServiceCalendar)

router.post(
  '/',
  [
    body('customer').notEmpty().withMessage('Customer reference is required'),
    body('tractor').custom((val, { req }) => {
      if (!val && !req.body.tractorModelId && !req.body.tractorModelName && !req.body.tractorModel) {
        throw new Error('Tractor or tractor model selection is required')
      }
      return true
    }),
    body('serviceType').notEmpty().withMessage('Service type is required'),
    body('serviceDate').custom((val, { req }) => {
      const dateVal = val || req.body.scheduledDate
      if (!dateVal) throw new Error('Valid service date is required')
      return true
    }),
  ],
  validate,
  createService
)

router.get('/:id', getServiceById)
router.patch('/:id', updateService)
router.delete('/:id', deleteService)

export default router
