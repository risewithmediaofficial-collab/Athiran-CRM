import { predictNextService } from '../../src/services/servicePrediction.service.js'

describe('Athiran Motors — Engine Hours & Service Prediction Algorithm', () => {
  test('Accurately predicts service when historical meter readings are available', () => {
    const tractor = {
      tractorId: 'ATH-TRC-001',
      lastServiceHours: 500,
      currentEngineHours: 620,
      serviceIntervalHours: 250, // Target = 750 hours
      estimatedDailyHours: 5,
    }

    // Historical readings over 20 days: 100 hours logged = 5 hours / day
    const readings = [
      { readingHours: 520, readingDate: new Date('2026-10-01') },
      { readingHours: 620, readingDate: new Date('2026-10-21') },
    ]

    const prediction = predictNextService(tractor, readings)

    // Target = 500 + 250 = 750
    expect(prediction.targetHours).toBe(750)
    // Hours operated since last service = 620 - 500 = 120
    expect(prediction.hoursOperated).toBe(120)
    // Remaining hours = 750 - 620 = 130
    expect(prediction.remainingHours).toBe(130)
    // Average daily hours = 100 / 20 = 5.0
    expect(prediction.avgDailyHours).toBe(5)
    // Days until service = ceil(130 / 5) = 26 days
    expect(prediction.estimatedDaysUntilService).toBe(26)
    expect(prediction.isOverdue).toBe(false)
    expect(prediction.isEstimate).toBe(false)
  })

  test('Flags overdue tractors when engine hours exceed target', () => {
    const tractor = {
      tractorId: 'ATH-TRC-002',
      lastServiceHours: 250,
      currentEngineHours: 510,
      serviceIntervalHours: 250, // Target = 500 hours
      estimatedDailyHours: 6,
    }

    const prediction = predictNextService(tractor, [])

    expect(prediction.targetHours).toBe(500)
    expect(prediction.remainingHours).toBe(0)
    expect(prediction.isOverdue).toBe(true)
    expect(prediction.alertLevel).toBe('overdue')
  })

  test('Triggers critical alert when remaining hours <= 10', () => {
    const tractor = {
      tractorId: 'ATH-TRC-003',
      lastServiceHours: 0,
      currentEngineHours: 242,
      serviceIntervalHours: 250, // Target = 250
      estimatedDailyHours: 4,
    }

    const prediction = predictNextService(tractor, [])

    expect(prediction.remainingHours).toBe(8)
    expect(prediction.alertLevel).toBe('critical')
  })
})

