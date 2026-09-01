import test from 'node:test'
import assert from 'node:assert/strict'
import { dateRange, formatLocalDate } from '../src/utils/date.js'

test('formatLocalDate preserves the local calendar day', () => {
  assert.equal(formatLocalDate(new Date(2026, 0, 2, 0, 30)), '2026-01-02')
})

test('dateRange crosses month boundaries in chronological order', () => {
  assert.deepEqual(
    dateRange(3, new Date(2026, 2, 1, 12)),
    ['2026-02-27', '2026-02-28', '2026-03-01']
  )
})
