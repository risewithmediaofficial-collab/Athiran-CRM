import 'dotenv/config'

/**
 * Service Prediction Engine
 * Calculates next service date and hour target based on historical meter readings.
 */

import dayjs from 'dayjs'

/**
 * Predict the next service date and remaining hours for a tractor.
 * @param {object} tractor - Tractor document
 * @param {Array} readings - Array of MeterReading documents (sorted ascending by readingDate)
 * @returns {object} prediction
 */
export const predictNextService = (tractor, readings = []) => {
  const {
    lastServiceHours = 0,
    currentEngineHours = 0,
    serviceIntervalHours = 250,
    estimatedDailyHours = 5,
  } = tractor

  const targetHours = lastServiceHours + serviceIntervalHours
  const remainingHours = targetHours - currentEngineHours
  const hoursOperated = currentEngineHours - lastServiceHours

  // Calculate average daily usage from reading history
  let avgDailyHours = estimatedDailyHours
  let isEstimate = true

  if (readings.length >= 2) {
    const sorted = [...readings].sort((a, b) => new Date(a.readingDate) - new Date(b.readingDate))
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const hoursDiff = last.readingHours - first.readingHours
    const daysDiff = dayjs(last.readingDate).diff(dayjs(first.readingDate), 'day')
    if (daysDiff > 0 && hoursDiff > 0) {
      avgDailyHours = hoursDiff / daysDiff
      isEstimate = false
    }
  }

  // Prevent division by zero
  let estimatedDaysUntilService = null
  let estimatedServiceDate = null
  if (avgDailyHours > 0 && remainingHours > 0) {
    estimatedDaysUntilService = Math.ceil(remainingHours / avgDailyHours)
    estimatedServiceDate = dayjs().add(estimatedDaysUntilService, 'day').toDate()
  }

  // Alert level
  let alertLevel = null
  if (remainingHours <= 0) alertLevel = 'overdue'
  else if (remainingHours <= 10) alertLevel = 'critical'
  else if (remainingHours <= 25) alertLevel = 'warning'
  else if (remainingHours <= 50) alertLevel = 'notice'

  return {
    currentEngineHours,
    lastServiceHours,
    targetHours,
    hoursOperated: Math.max(0, hoursOperated),
    remainingHours: Math.max(0, remainingHours),
    avgDailyHours: Math.round(avgDailyHours * 10) / 10,
    estimatedDaysUntilService,
    estimatedServiceDate,
    alertLevel,
    isOverdue: remainingHours <= 0,
    isEstimate,
    serviceIntervalHours,
  }
}

