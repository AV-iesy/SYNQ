import test from 'node:test'
import assert from 'node:assert/strict'
import { calendarMonth, dateRange, formatLocalDate } from '../src/utils/date.js'

test('formatLocalDate preserves the local calendar day', () => {
  assert.equal(formatLocalDate(new Date(2026, 0, 2, 0, 30)), '2026-01-02')
})

test('dateRange crosses month boundaries in chronological order', () => {
  assert.deepEqual(
    dateRange(3, new Date(2026, 2, 1, 12)),
    ['2026-02-27', '2026-02-28', '2026-03-01']
  )
})

test('calendarMonth builds a complete, correctly aligned six-week calendar', () => {
  const october = calendarMonth(2026, 9)

  assert.equal(october.length, 42)
  assert.deepEqual(october[0], {
    key: '2026-09-27', day: 27, month: 8, year: 2026, weekday: 0, isCurrentMonth: false,
  })
  assert.deepEqual(october[4], {
    key: '2026-10-01', day: 1, month: 9, year: 2026, weekday: 4, isCurrentMonth: true,
  })
  assert.equal(october[34].key, '2026-10-31')
  assert.equal(october[41].key, '2026-11-07')
})
