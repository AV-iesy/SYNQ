const test = require('node:test')
const assert = require('node:assert/strict')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { getJwtSignOptions, getJwtVerifyOptions } = require('../utils/config')
const User = require('../models/User')
const Task = require('../models/Task')
const Schedule = require('../models/Schedule')
const PaymentRecord = require('../models/PaymentRecord')

test('JWT contract pins algorithm, issuer, and audience', () => {
  const secret = 's'.repeat(32)
  const payload = { id: new mongoose.Types.ObjectId().toString(), ver: 0 }
  const token = jwt.sign(payload, secret, { ...getJwtSignOptions(), expiresIn: '1m' })
  const decoded = jwt.verify(token, secret, getJwtVerifyOptions())
  assert.equal(decoded.id, payload.id)
  assert.equal(decoded.iss, 'synq-api')
  assert.equal(decoded.aud, 'synq-web')

  const unsigned = jwt.sign(payload, null, { algorithm: 'none' })
  assert.throws(() => jwt.verify(unsigned, secret, getJwtVerifyOptions()))
})

test('sensitive identity fields are excluded by default', () => {
  assert.equal(User.schema.path('password').options.select, false)
  assert.equal(User.schema.path('tokenVersion').options.select, false)
  assert.equal(Schedule.schema.path('sourceInput').options.select, false)
})

test('superadmin receives premium access without changing payment state', () => {
  const regular = new User({ name: 'Regular', email: 'regular@example.com', password: 'password123' })
  const premium = new User({ name: 'Premium', email: 'premium@example.com', password: 'password123', isPremium: true })
  const admin = new User({ name: 'Admin', email: 'admin@example.com', password: 'password123', role: 'superadmin' })

  assert.equal(regular.role, 'user')
  assert.equal(regular.hasPremiumAccess(), false)
  assert.equal(premium.hasPremiumAccess(), true)
  assert.equal(admin.isPremium, false)
  assert.equal(admin.hasPremiumAccess(), true)

  const safeAdmin = admin.toSafeObject()
  assert.equal(safeAdmin.role, 'superadmin')
  assert.equal(safeAdmin.hasPremiumAccess, true)
  assert.equal(safeAdmin.isPremium, false)
})

test('resource JSON removes internal ownership fields', () => {
  const userId = new mongoose.Types.ObjectId()
  const task = new Task({ user: userId, title: 'Safe output', date: '2026-09-07' }).toJSON()
  const schedule = new Schedule({
    user: userId,
    date: '2026-09-07',
    sourceInput: 'private prompt',
    blocks: [{ time: '09:00', endTime: '10:00', label: 'Work', tag: 'work' }],
  }).toJSON()
  assert.equal(task.user, undefined)
  assert.equal(task.__v, undefined)
  assert.equal(schedule.user, undefined)
  assert.equal(schedule.sourceInput, undefined)
})

test('payment records uniquely bind provider orders and transaction IDs', () => {
  const indexes = PaymentRecord.schema.indexes()
  const orderIndex = indexes.find(([keys]) => keys.provider === 1 && keys.providerOrderId === 1)
  const paymentIndex = indexes.find(([keys]) => keys.provider === 1 && keys.paymentId === 1)
  assert.equal(orderIndex?.[1]?.unique, true)
  assert.equal(paymentIndex?.[1]?.unique, true)
  assert.ok(paymentIndex?.[1]?.partialFilterExpression)
})
