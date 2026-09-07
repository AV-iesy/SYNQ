import test from 'node:test'
import assert from 'node:assert/strict'
import { getApiErrorMessage } from '../src/api/errors.js'

test('uses a safe API response message', () => {
  const error = { response: { data: { message: 'AI schedule generation is temporarily unavailable' } } }
  assert.equal(getApiErrorMessage(error), 'AI schedule generation is temporarily unavailable')
})

test('distinguishes network failures from server failures', () => {
  assert.equal(
    getApiErrorMessage(new Error('Network Error')),
    'Could not reach the server. Check your connection and try again.'
  )
  assert.equal(getApiErrorMessage({ response: { data: {} } }, 'Try again'), 'Try again')
})
