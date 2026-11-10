import express from 'express'
import { body } from 'express-validator'
import {
  getTractorModels,
  getTractorModelById,
  createTractorModel,
  updateTractorModel,
  deleteTractorModel,
} from '../controllers/tractorModel.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorizeAny } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { PERMISSIONS } from '../constants/permissions.js'

const router = express.Router()
router.use(authenticate)

router.get('/', getTractorModels)
router.get('/:id', getTractorModelById)

router.post(
  '/',
  authorizeAny(PERMISSIONS.TRACTORS_CREATE, PERMISSIONS.TRACTORS_EDIT, PERMISSIONS.SETTINGS_MANAGE),
  [
    body('modelName').trim().notEmpty().withMessage('Model name is required'),
    body('horsepower').isNumeric().withMessage('Numeric horsepower is required'),
  ],
  validate,
  createTractorModel
)

router.patch(
  '/:id',
  authorizeAny(PERMISSIONS.TRACTORS_EDIT, PERMISSIONS.SETTINGS_MANAGE),
  updateTractorModel
)

router.delete(
  '/:id',
  authorizeAny(PERMISSIONS.TRACTORS_EDIT, PERMISSIONS.SETTINGS_MANAGE),
  deleteTractorModel
)

export default router

