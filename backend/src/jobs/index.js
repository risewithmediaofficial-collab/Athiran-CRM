import cron from 'node-cron'
import { logger } from '../utils/logger.js'

// Placeholder — full implementations in Phase 7
const followupReminderJob = () => {
  logger.info('[Job] Follow-up reminder check running...')
  // TODO: query pending follow-ups due in next 30min and emit notifications
}

const serviceReminderJob = () => {
  logger.info('[Job] Service reminder check running...')
  // TODO: query tractors approaching service threshold and create notifications
}

const missedFollowupJob = () => {
  logger.info('[Job] Missed follow-up sweep running...')
  // TODO: mark overdue pending follow-ups as missed
}

export const initJobs = () => {
  // In PM2 cluster mode, only run cron jobs on instance 0 to prevent duplicate job execution
  if (process.env.NODE_APP_INSTANCE !== undefined && process.env.NODE_APP_INSTANCE !== '0') {
    logger.info(`Background jobs skipped on PM2 cluster worker ${process.env.NODE_APP_INSTANCE}`)
    return
  }

  // Every 30 min — follow-up reminders
  cron.schedule('*/30 * * * *', followupReminderJob, { timezone: 'Asia/Kolkata' })
  // Every hour — service reminders
  cron.schedule('0 * * * *', serviceReminderJob, { timezone: 'Asia/Kolkata' })
  // Every midnight — missed follow-up sweep
  cron.schedule('0 0 * * *', missedFollowupJob, { timezone: 'Asia/Kolkata' })

  logger.info('Background jobs initialized')
}

