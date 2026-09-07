const test = require('node:test')
const assert = require('node:assert/strict')
const { generateSchedule } = require('../controllers/scheduleController')

test('schedule generation reports missing server configuration safely', async () => {
  const originalKey = process.env.GROQ_API_KEY
  delete process.env.GROQ_API_KEY

  let status
  let body
  const res = {
    status(value) {
      status = value
      return this
    },
    json(value) {
      body = value
      return this
    },
  }

  try {
    await generateSchedule({ body: { input: 'Plan my day' } }, res)
  } finally {
    if (originalKey === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = originalKey
  }

  assert.equal(status, 503)
  assert.deepEqual(body, {
    code: 'AI_NOT_CONFIGURED',
    message: 'AI schedule generation is temporarily unavailable',
  })
})
