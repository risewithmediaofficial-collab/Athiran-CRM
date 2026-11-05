import { v4 as uuidv4 } from 'uuid'

/**
 * Generate a human-readable unique ID with a prefix.
 * e.g. ATH-LEAD-A3F9B2
 */
export const generateId = (prefix) => {
  const uid = uuidv4().replace(/-/g, '').toUpperCase().slice(0, 8)
  return `${prefix}-${uid}`
}

export const PREFIXES = {
  LEAD: 'ATH-LEAD',
  CUSTOMER: 'ATH-CUST',
  TRACTOR: 'ATH-TRC',
  SERVICE: 'ATH-SVC',
  EMPLOYEE: 'ATH-EMP',
  LEAVE: 'ATH-LV',
}

