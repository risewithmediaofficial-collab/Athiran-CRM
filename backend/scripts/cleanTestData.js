/**
 * Cleans all dummy / test data from the MongoDB database
 * Keeps: System roles and the superadmin account.
 * Deletes: All test leads, lead activities, assignments, notifications, audit logs, test users.
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { Lead } from '../src/models/Lead.js'
import { LeadActivity } from '../src/models/LeadActivity.js'
import { LeadAssignment } from '../src/models/LeadAssignment.js'
import { Notification } from '../src/models/Notification.js'
import { User } from '../src/models/User.js'
import { Customer } from '../src/models/Customer.js'
import { Tractor } from '../src/models/Tractor.js'
import { ServiceRecord } from '../src/models/ServiceRecord.js'
import { MeterReading } from '../src/models/MeterReading.js'
import { LeaveRequest } from '../src/models/LeaveRequest.js'
import { LeaveHandover } from '../src/models/LeaveHandover.js'
import { FollowUp } from '../src/models/FollowUp.js'
import { logger } from '../src/utils/logger.js'

const cleanData = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/athiran_crm')
  logger.info('Connected to MongoDB for data cleanup...')

  // 1. Delete all leads, activities, assignments, followups
  const leadsDel = await Lead.deleteMany({})
  const actsDel = await LeadActivity.deleteMany({})
  const assignDel = await LeadAssignment.deleteMany({})
  const followDel = await FollowUp.deleteMany({})
  logger.info(`Deleted ${leadsDel.deletedCount} leads, ${actsDel.deletedCount} activities, ${assignDel.deletedCount} assignments, ${followDel.deletedCount} follow-ups.`)

  // 2. Delete customers, tractors, services
  const custDel = await Customer.deleteMany({})
  const tracDel = await Tractor.deleteMany({})
  const svcDel = await ServiceRecord.deleteMany({})
  const meterDel = await MeterReading.deleteMany({})
  logger.info(`Deleted ${custDel.deletedCount} customers, ${tracDel.deletedCount} tractors, ${svcDel.deletedCount} services.`)

  // 3. Delete notifications and leave requests
  const notifDel = await Notification.deleteMany({})
  const leaveDel = await LeaveRequest.deleteMany({})
  const handoverDel = await LeaveHandover.deleteMany({})
  logger.info(`Deleted ${notifDel.deletedCount} notifications, ${leaveDel.deletedCount} leaves.`)

  // 4. Delete test users (keep superadmin only)
  const usersDel = await User.deleteMany({ username: { $ne: 'superadmin' } })
  logger.info(`Deleted ${usersDel.deletedCount} test users. Kept superadmin.`)

  logger.info('✅ Database is now 100% clean and ready for real production entry!')
  await mongoose.disconnect()
  process.exit(0)
}

cleanData().catch((err) => {
  logger.error('Cleanup failed:', err)
  process.exit(1)
})

