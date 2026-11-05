import express from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { Notification } from '../models/Notification.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const router = express.Router()
router.use(authenticate)

router.get('/', asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
  return ApiResponse.ok(notifications, 'Notifications list').send(res)
}))

router.get('/unread-count', asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false })
  return ApiResponse.ok({ unreadCount: count }, 'Unread count').send(res)
}))

router.patch('/:id/read', asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  )
  return ApiResponse.ok(notification, 'Notification marked as read').send(res)
}))

router.patch('/read-all', asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  )
  return ApiResponse.ok(null, 'All notifications marked as read').send(res)
}))

export default router

