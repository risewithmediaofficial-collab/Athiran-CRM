/**
 * Seed script: creates all 8 system roles with correct permissions.
 * Run: node scripts/seedRoles.js
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import { Role } from '../src/models/Role.js'
import { ROLE_PERMISSIONS } from '../src/constants/permissions.js'
import { logger } from '../src/utils/logger.js'

const ROLE_DEFINITIONS = [
  { name: 'super_admin', displayName: 'Super Admin', department: 'admin', isSystem: true },
  { name: 'admin', displayName: 'Admin', department: 'admin', isSystem: true },
  { name: 'sales_manager', displayName: 'Sales Manager', department: 'sales', isSystem: true },
  { name: 'sales_executive', displayName: 'Sales Executive', department: 'sales', isSystem: true },
  { name: 'telecaller', displayName: 'Telecaller', department: 'sales', isSystem: true },
  { name: 'service_manager', displayName: 'Service Manager', department: 'service', isSystem: true },
  { name: 'service_advisor', displayName: 'Service Advisor', department: 'service', isSystem: true },
  { name: 'service_technician', displayName: 'Service Technician', department: 'service', isSystem: true },
]

const seedRoles = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/athiran_crm')
  logger.info('Connected to MongoDB')

  for (const def of ROLE_DEFINITIONS) {
    const permissions = ROLE_PERMISSIONS[def.name] || []
    await Role.findOneAndUpdate(
      { name: def.name },
      { ...def, permissions },
      { upsert: true, new: true }
    )
    logger.info(`✓ Role seeded: ${def.displayName} (${permissions.length} permissions)`)
  }

  logger.info('All roles seeded successfully')
  await mongoose.disconnect()
  process.exit(0)
}

seedRoles().catch((err) => {
  logger.error('Seed failed:', err)
  process.exit(1)
})

