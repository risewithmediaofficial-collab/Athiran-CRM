import express from 'express'
import { getRoles, createRole, updateRole } from '../controllers/role.controller.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { PERMISSIONS } from '../constants/permissions.js'

const router = express.Router()
router.use(authenticate)
router.get('/', getRoles)
router.post('/', authorize(PERMISSIONS.RBAC_MANAGE), createRole)
router.patch('/:id', authorize(PERMISSIONS.RBAC_MANAGE), updateRole)
export default router
