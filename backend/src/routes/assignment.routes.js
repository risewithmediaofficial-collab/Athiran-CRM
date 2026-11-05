import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const router = express.Router()
router.use(authenticate)

router.get('/', (req, res) => ApiResponse.ok([], 'Assignments list').send(res))
router.get('/:leadId', (req, res) => ApiResponse.ok([], 'Lead assignment history').send(res))

export default router

