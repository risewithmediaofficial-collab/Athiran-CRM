import argon2 from 'argon2'
import { Role } from '../models/Role.js'
import { User } from '../models/User.js'
import { ROLE_PERMISSIONS } from '../constants/permissions.js'
import { generateId, PREFIXES } from '../utils/generateId.js'
import { logger } from '../utils/logger.js'

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

export const seedInitialData = async () => {
  try {
    for (const def of ROLE_DEFINITIONS) {
      const permissions = ROLE_PERMISSIONS[def.name] || []
      await Role.findOneAndUpdate(
        { name: def.name },
        { ...def, permissions },
        { upsert: true, new: true }
      )
    }

    const adminUsername = (process.env.SEED_ADMIN_USERNAME || 'superadmin').toLowerCase()
    const existing = await User.findOne({ username: adminUsername })
    if (!existing) {
      const superAdminRole = await Role.findOne({ name: 'super_admin' })
      const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@2024!'
      const passwordHash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      })

      await User.create({
        employeeId: generateId(PREFIXES.EMPLOYEE),
        fullName: process.env.SEED_ADMIN_NAME || 'Super Admin',
        email: process.env.SEED_ADMIN_EMAIL || 'admin@athiranmotors.com',
        mobile: '9999999999',
        username: adminUsername,
        passwordHash,
        department: 'admin',
        designation: 'System Administrator',
        role: superAdminRole._id,
        joiningDate: new Date(),
        accountStatus: 'active',
      })
      logger.info(`✓ Auto-seeded Super Admin account (${adminUsername})`)
    }
  } catch (err) {
    logger.error('Auto-seed error:', err)
  }
}

