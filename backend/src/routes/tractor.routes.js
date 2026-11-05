import express from 'express'
import {
  getTractors,
  createTractor,
  getTractorById,
  updateTractor,
  deleteTractor,
  getTractorServiceHistory,
  getTractorMeterReadings,
  addMeterReading,
  getNextServicePrediction,
} from '../controllers/tractor.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'
import { body } from 'express-validator'

const router = express.Router()
router.use(authenticate)

router.get('/', getTractors)

router.post(
  '/',
  [
    body('customer').notEmpty().withMessage('Customer reference is required'),
    body('modelName').custom((val, { req }) => {
      const m = val || req.body.model
      if (!m || !String(m).trim()) throw new Error('Tractor model is required')
      return true
    }),
  ],
  validate,
  createTractor
)

router.get('/:id', getTractorById)
router.patch('/:id', updateTractor)
router.delete('/:id', deleteTractor)
router.get('/:id/service-history', getTractorServiceHistory)
router.get('/:id/meter-readings', getTractorMeterReadings)

router.post(
  '/:id/meter-readings',
  [body('readingHours').isNumeric().withMessage('Valid numeric reading hours is required')],
  validate,
  addMeterReading
)

router.get('/:id/next-service-prediction', getNextServicePrediction)

export default router
