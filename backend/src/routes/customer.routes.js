import express from 'express'
import {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerTractors,
  getCustomerServices,
} from '../controllers/customer.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'
import { body } from 'express-validator'

const router = express.Router()
router.use(authenticate)

router.get('/', getCustomers)

router.post(
  '/',
  [
    body('customerName').custom((val, { req }) => {
      const name = val || req.body.fullName
      if (!name || !name.trim()) throw new Error('Customer name is required')
      return true
    }),
    body('mobile').custom((val, { req }) => {
      const num = val || req.body.primaryMobile
      if (!num || !num.trim()) throw new Error('Mobile number is required')
      return true
    }),
  ],
  validate,
  createCustomer
)

router.get('/:id', getCustomerById)
router.patch('/:id', updateCustomer)
router.delete('/:id', deleteCustomer)
router.get('/:id/tractors', getCustomerTractors)
router.get('/:id/services', getCustomerServices)

export default router
