import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import duration from 'dayjs/plugin/duration.js'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
dayjs.extend(duration)

export const IST_TIMEZONE = 'Asia/Kolkata'

export const toIST = (date) => dayjs(date).tz(IST_TIMEZONE)
export const nowIST = () => dayjs().tz(IST_TIMEZONE)
export const startOfDayIST = (date) => toIST(date || new Date()).startOf('day').toDate()
export const endOfDayIST = (date) => toIST(date || new Date()).endOf('day').toDate()

export const daysDiff = (dateA, dateB) => {
  const a = dayjs(dateA)
  const b = dayjs(dateB)
  return Math.abs(b.diff(a, 'day'))
}

export const addDays = (date, days) => dayjs(date).add(days, 'day').toDate()

export const formatDate = (date, format = 'DD MMM YYYY') => dayjs(date).tz(IST_TIMEZONE).format(format)

export const isOverdue = (date) => dayjs().isAfter(dayjs(date))

