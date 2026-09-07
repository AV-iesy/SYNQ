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

test('schedule generation uses the supported model and structured output', async () => {
  const originalKey = process.env.GROQ_API_KEY
  const originalFetch = global.fetch
  process.env.GROQ_API_KEY = 'test-key'
  let requestBody
  let fetchCalls = 0

  global.fetch = async (_url, options) => {
    fetchCalls += 1
    requestBody = JSON.parse(options.body)
    const blocks = fetchCalls === 1
      ? [
          { time: '07:00', endTime: '08:00', label: 'Wake up', tag: 'wake' },
          { time: '07:30', endTime: '08:30', label: 'Overlapping block', tag: 'personal' },
        ]
      : [
          { time: '07:00', endTime: '07:30', label: 'Wake up', tag: 'wake' },
          { time: '23:00', endTime: '07:00', label: 'Sleep', tag: 'sleep' },
        ]
    const payload = Buffer.from(JSON.stringify({
      choices: [{
        message: {
          content: JSON.stringify({ blocks }),
        },
      }],
    }))

    return {
      ok: true,
      headers: { get: () => String(payload.byteLength) },
      body: {
        getReader() {
          let sent = false
          return {
            async read() {
              if (sent) return { done: true }
              sent = true
              return { done: false, value: payload }
            },
          }
        },
      },
    }
  }

  let status = 200
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
    await generateSchedule({ body: { input: 'Wake at 7 and sleep at 11' } }, res)
  } finally {
    global.fetch = originalFetch
    if (originalKey === undefined) delete process.env.GROQ_API_KEY
    else process.env.GROQ_API_KEY = originalKey
  }

  assert.equal(status, 200)
  assert.equal(requestBody.model, 'openai/gpt-oss-20b')
  assert.equal(requestBody.response_format.type, 'json_schema')
  assert.equal(requestBody.response_format.json_schema.strict, true)
  assert.equal(requestBody.temperature, 0.2)
  assert.equal(fetchCalls, 2)
  assert.equal(body.blocks.length, 2)
})
