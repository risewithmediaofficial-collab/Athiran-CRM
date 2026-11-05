import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const router = express.Router()
router.use(authenticate)

router.get('/sales/overview', (req, res) => ApiResponse.ok({}, 'Sales overview report').send(res))
router.get('/sales/leads-by-source', (req, res) => ApiResponse.ok([], 'Leads by source').send(res))
router.get('/sales/employee-performance', (req, res) => ApiResponse.ok([], 'Employee performance report').send(res))
router.get('/service/overview', (req, res) => ApiResponse.ok({}, 'Service overview report').send(res))
router.get('/service/workload', (req, res) => ApiResponse.ok([], 'Service workload report').send(res))
router.get('/export/:type', (req, res) => ApiResponse.ok({}, 'Export report').send(res))

export default router

