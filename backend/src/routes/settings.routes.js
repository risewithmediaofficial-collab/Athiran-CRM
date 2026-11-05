import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { SystemSetting } from '../models/SystemSetting.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { PERMISSIONS } from '../constants/permissions.js'

const router = express.Router()
router.use(authenticate)

router.get('/', asyncHandler(async (req, res) => {
  const settings = await SystemSetting.find().sort({ category: 1, key: 1 })
  return ApiResponse.ok(settings, 'System settings').send(res)
}))

router.patch('/:key', authorize(PERMISSIONS.SETTINGS_MANAGE), asyncHandler(async (req, res) => {
  const { value, label, category, description } = req.body
  const setting = await SystemSetting.findOneAndUpdate(
    { key: req.params.key },
    { value, label, category, description, updatedBy: req.user._id },
    { upsert: true, new: true }
  )
  return ApiResponse.ok(setting, 'Setting updated').send(res)
}))

router.post('/bulk', authorize(PERMISSIONS.SETTINGS_MANAGE), asyncHandler(async (req, res) => {
  const { settings } = req.body
  if (!Array.isArray(settings)) {
    return ApiResponse.ok([], 'No settings updated').send(res)
  }
  for (const s of settings) {
    await SystemSetting.findOneAndUpdate(
      { key: s.key },
      { value: s.value, updatedBy: req.user._id },
      { upsert: true }
    )
  }
  return ApiResponse.ok(null, 'Settings updated successfully').send(res)
}))

export default router

