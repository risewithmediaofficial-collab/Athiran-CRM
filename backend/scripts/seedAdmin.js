/**
 * Seed script: creates the first Super Admin user.
 * Run: node scripts/seedAdmin.js
 * Prerequisite: seedRoles.js must run first.
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import argon2 from 'argon2'
import { User } from '../src/models/User.js'
import { Role } from '../src/models/Role.js'
import { generateId, PREFIXES } from '../src/utils/generateId.js'
import { logger } from '../src/utils/logger.js'

const seedAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/athiran_crm')
  logger.info('Connected to MongoDB')

  // 1. Ensure roles exist
  const superAdminRole = await Role.findOne({ name: 'super_admin' })
  if (!superAdminRole) {
    logger.error('super_admin role not found. Run seedRoles.js first.')
    process.exit(1)
  }

  // 2. Check if admin already exists
  const existing = await User.findOne({ username: process.env.SEED_ADMIN_USERNAME || 'superadmin' })
  if (existing) {
    logger.info(`Admin already exists: ${existing.email}`)
    await mongoose.disconnect()
    return
  }

  // 3. Create admin
  const passwordHash = await argon2.hash(process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@2024!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  })

  const admin = await User.create({
    employeeId: generateId(PREFIXES.EMPLOYEE),
    fullName: process.env.SEED_ADMIN_NAME || 'Super Admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@athiranmotors.com',
    mobile: '9999999999',
    username: process.env.SEED_ADMIN_USERNAME || 'superadmin',
    passwordHash,
    department: 'admin',
    designation: 'System Administrator',
    role: superAdminRole._id,
    joiningDate: new Date(),
    accountStatus: 'active',
  })

  logger.info(`✓ Super Admin created:`)
  logger.info(`  Email: ${admin.email}`)
  logger.info(`  Username: ${admin.username}`)
  logger.info(`  Employee ID: ${admin.employeeId}`)
  logger.info(`  Password: ${process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@2024!'} (CHANGE THIS IMMEDIATELY)`)

  await mongoose.disconnect()
  process.exit(0)
}

seedAdmin().catch((err) => {
  logger.error('Admin seed failed:', err)
  process.exit(1)
})

