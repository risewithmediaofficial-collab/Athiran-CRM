import request from 'supertest'
import mongoose from 'mongoose'
import app from '../../src/app.js'
import { env } from '../../src/config/environment.js'

describe('Athiran Motors CRM — API Integration Verification', () => {
  let server
  let accessToken
  let createdLeadId

  beforeAll(async () => {
    await mongoose.connect(env.MONGODB_URI)
  })

  afterAll(async () => {
    await mongoose.disconnect()
  })

  test('1. Health check returns 200 OK', async () => {
    const res = await request(app).get(`/api/${env.API_VERSION}/health`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  test('2. Login with seeded Super Admin credentials', async () => {
    const res = await request(app)
      .post(`/api/${env.API_VERSION}/auth/login`)
      .send({
        username: 'superadmin',
        password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@2024!',
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.body.data.user.username).toBe('superadmin')
    expect(res.body.data.user.role.name).toBe('super_admin')

    accessToken = res.body.data.accessToken
  })

  test('3. GET /auth/me returns current user profile and full permissions', async () => {
    const res = await request(app)
      .get(`/api/${env.API_VERSION}/auth/me`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.username).toBe('superadmin')
    expect(res.body.data.role.permissions.length).toBeGreaterThan(40)
  })

  test('4. Create Sales Lead (POST /leads)', async () => {
    const res = await request(app)
      .post(`/api/${env.API_VERSION}/leads`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerName: 'Ramasamy Gounder',
        primaryMobile: '9842156789',
        village: 'Pollachi',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        leadTemperature: 'hot',
        leadSource: 'walk_in',
        tractorModelInterested: 'Athiran PowerTrac 50 HP',
        agriculturalLandArea: 15,
        estimatedBudget: 850000,
        remarks: 'Interested in 4WD model with financing',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.leadId).toMatch(/^ATH-LEAD-/)
    expect(res.body.data.customerName).toBe('Ramasamy Gounder')

    createdLeadId = res.body.data._id
  })

  test('5. Retrieve Lead by ID (GET /leads/:id)', async () => {
    const res = await request(app)
      .get(`/api/${env.API_VERSION}/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.customerName).toBe('Ramasamy Gounder')
  })

  test('6. Record Activity on Lead (POST /leads/:id/activities)', async () => {
    const res = await request(app)
      .post(`/api/${env.API_VERSION}/leads/${createdLeadId}/activities`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        activityType: 'outgoing_call',
        description: 'Called customer to explain tractor subsidies and loan options',
        outcome: 'Customer requested a test drive tomorrow at 10 AM',
        nextAction: 'Schedule field demonstration',
        nextFollowUpDate: new Date(Date.now() + 86400000).toISOString(),
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.activityType).toBe('outgoing_call')
  })

  test('7. Lead Dashboard Statistics (GET /leads/stats/summary)', async () => {
    const res = await request(app)
      .get(`/api/${env.API_VERSION}/leads/stats/summary`)
      .set('Authorization', `Bearer ${accessToken}`)

    expect(res.status).toBe(200)
    expect(res.body.data.total).toBeGreaterThanOrEqual(1)
    expect(res.body.data.hotLeads).toBeGreaterThanOrEqual(1)
  })

  test('8. Unauthorized access blocked (401)', async () => {
    const res = await request(app).get(`/api/${env.API_VERSION}/leads`)
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})

