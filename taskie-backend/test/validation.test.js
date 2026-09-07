const test = require('node:test')
const assert = require('node:assert/strict')
const { isValidDateKey, isValidTime, parsePageOptions } = require('../utils/validation')

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

test('pagination is bounded against resource-exhaustion requests', () => {
  assert.deepEqual(parsePageOptions({ limit: '999999', page: '999999' }), {
    limit: 500,
    page: 100,
    skip: 49500,
  })
  assert.deepEqual(parsePageOptions({ limit: '-5', page: '0' }), {
    limit: 1,
    page: 1,
    skip: 0,
  })
})
