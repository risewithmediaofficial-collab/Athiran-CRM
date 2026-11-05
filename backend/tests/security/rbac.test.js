import request from 'supertest'
import mongoose from 'mongoose'
import argon2 from 'argon2'
import app from '../../src/app.js'
import { env } from '../../src/config/environment.js'
import { User } from '../../src/models/User.js'
import { Role } from '../../src/models/Role.js'
import { Lead } from '../../src/models/Lead.js'
import { generateId, PREFIXES } from '../../src/utils/generateId.js'

describe('Athiran Motors CRM — Security & RBAC Enforcement', () => {
  let adminToken
  let salesExec1Token
  let salesExec2Token
  let exec1User
  let exec2User
  let exec1Lead

  beforeAll(async () => {
    await mongoose.connect(env.MONGODB_URI)

    // Admin login
    const adminRes = await request(app)
      .post(`/api/${env.API_VERSION}/auth/login`)
      .send({ username: 'superadmin', password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@2024!' })
    adminToken = adminRes.body.data.accessToken

    const salesExecRole = await Role.findOne({ name: 'sales_executive' })

    const hash = await argon2.hash('Exec@Password123!', { type: argon2.argon2id })

    // Create 2 Sales Executives
    exec1User = await User.findOneAndUpdate(
      { username: 'sales_exec_1' },
      {
        employeeId: generateId(PREFIXES.EMPLOYEE),
        fullName: 'Sales Executive One',
        email: 'exec1@athiranmotors.com',
        mobile: '9842100001',
        username: 'sales_exec_1',
        passwordHash: hash,
        department: 'sales',
        designation: 'Sales Executive',
        role: salesExecRole._id,
        joiningDate: new Date(),
        accountStatus: 'active',
      },
      { upsert: true, new: true }
    )

    exec2User = await User.findOneAndUpdate(
      { username: 'sales_exec_2' },
      {
        employeeId: generateId(PREFIXES.EMPLOYEE),
        fullName: 'Sales Executive Two',
        email: 'exec2@athiranmotors.com',
        mobile: '9842100002',
        username: 'sales_exec_2',
        passwordHash: hash,
        department: 'sales',
        designation: 'Sales Executive',
        role: salesExecRole._id,
        joiningDate: new Date(),
        accountStatus: 'active',
      },
      { upsert: true, new: true }
    )

    // Login both
    const res1 = await request(app)
      .post(`/api/${env.API_VERSION}/auth/login`)
      .send({ username: 'sales_exec_1', password: 'Exec@Password123!' })
    salesExec1Token = res1.body.data.accessToken

    const res2 = await request(app)
      .post(`/api/${env.API_VERSION}/auth/login`)
      .send({ username: 'sales_exec_2', password: 'Exec@Password123!' })
    salesExec2Token = res2.body.data.accessToken

    // Exec 1 creates a private lead
    const leadRes = await request(app)
      .post(`/api/${env.API_VERSION}/leads`)
      .set('Authorization', `Bearer ${salesExec1Token}`)
      .send({
        customerName: 'Private Farmer Lead',
        primaryMobile: '9842199999',
        leadTemperature: 'warm',
        leadSource: 'walk_in',
      })
    exec1Lead = leadRes.body.data
  })

  afterAll(async () => {
    await mongoose.disconnect()
  })

  test('SECURITY: Sales Executive 2 CANNOT access Sales Executive 1 private lead (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/${env.API_VERSION}/leads/${exec1Lead._id}`)
      .set('Authorization', `Bearer ${salesExec2Token}`)

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
    expect(res.body.error.code).toBe('FORBIDDEN')
  })

  test('SECURITY: Sales Executive 1 CAN access their own private lead (200 OK)', async () => {
    const res = await request(app)
      .get(`/api/${env.API_VERSION}/leads/${exec1Lead._id}`)
      .set('Authorization', `Bearer ${salesExec1Token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.customerName).toBe('Private Farmer Lead')
  })

  test('SECURITY: Admin CAN access any lead regardless of ownership (200 OK)', async () => {
    const res = await request(app)
      .get(`/api/${env.API_VERSION}/leads/${exec1Lead._id}`)
      .set('Authorization', `Bearer ${adminToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.customerName).toBe('Private Farmer Lead')
  })

  test('SECURITY: Sales Executive CANNOT access Admin User Management endpoints (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/${env.API_VERSION}/users`)
      .set('Authorization', `Bearer ${salesExec1Token}`)

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })

  test('SECURITY: Deactivated user is immediately blocked from API access (403 Forbidden)', async () => {
    // Deactivate Exec 2
    await User.findByIdAndUpdate(exec2User._id, { accountStatus: 'inactive' })

    const res = await request(app)
      .get(`/api/${env.API_VERSION}/leads`)
      .set('Authorization', `Bearer ${salesExec2Token}`)

    expect(res.status).toBe(403)
    expect(res.body.error.message).toMatch(/deactivated/i)
  })
})

