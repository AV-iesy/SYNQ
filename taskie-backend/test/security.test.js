const test = require('node:test')
const assert = require('node:assert/strict')
const { app } = require('../index')

function listen() {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server))
    server.once('error', reject)
  })
}

async function withServer(run) {
  const server = await listen()
  try {
    const { port } = server.address()
    await run(`http://127.0.0.1:${port}`)
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
}

test('all private route groups reject anonymous access', async () => {
  await withServer(async baseUrl => {
    const requests = [
      fetch(`${baseUrl}/api/auth/me`),
      fetch(`${baseUrl}/api/tasks`),
      fetch(`${baseUrl}/api/schedule`),
      fetch(`${baseUrl}/api/journal`),
      fetch(`${baseUrl}/api/payment/status`),
      fetch(`${baseUrl}/api/schedule/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: 'Plan my day' }),
      }),
    ]
    const responses = await Promise.all(requests)
    assert.deepEqual(responses.map(response => response.status), [401, 401, 401, 401, 401, 401])
  })
})

test('malformed bearer tokens fail with a generic response', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      headers: { Authorization: 'Bearer attacker-controlled-token' },
    })
    assert.equal(response.status, 401)
    assert.deepEqual(await response.json(), { message: 'Not authorized' })
  })
})

test('unsafe methods require JSON and oversized bodies are rejected', async () => {
  await withServer(async baseUrl => {
    const wrongType = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'email=test@example.com',
    })
    assert.equal(wrongType.status, 415)

    const oversized = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'x'.repeat(70000) }),
    })
    assert.equal(oversized.status, 413)
  })
})

test('unapproved browser origins are rejected', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: 'https://attacker.example' },
    })
    assert.equal(response.status, 403)
    assert.equal(response.headers.get('access-control-allow-origin'), null)
  })
})

test('API responses disable caching and hide framework fingerprinting', async () => {
  await withServer(async baseUrl => {
    const response = await fetch(`${baseUrl}/api/health`)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.equal(response.headers.get('x-powered-by'), null)
    assert.ok(response.headers.get('x-content-type-options'))
    assert.ok(response.headers.get('content-security-policy'))
  })
})
