const test = require('node:test')
const assert = require('node:assert/strict')
const { isValidDateKey, isValidTime } = require('../utils/validation')

test('date validation accepts real ISO calendar dates', () => {
  assert.equal(isValidDateKey('2024-02-29'), true)
  assert.equal(isValidDateKey('2025-02-29'), false)
  assert.equal(isValidDateKey('2026-13-01'), false)
  assert.equal(isValidDateKey('01-01-2026'), false)
})

test('time validation accepts only 24-hour HH:MM values', () => {
  assert.equal(isValidTime('00:00'), true)
  assert.equal(isValidTime('23:59'), true)
  assert.equal(isValidTime('24:00'), false)
  assert.equal(isValidTime('9:30'), false)
})
