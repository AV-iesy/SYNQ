const test = require('node:test')
const assert = require('node:assert/strict')
const { app } = require('../index')

function listen() {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server))
    server.once('error', reject)
  })
}

test('health endpoint responds without requiring a database connection', async () => {
  const server = await listen()
  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/health`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { status: 'ok', message: 'SYNQ backend is running' })
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
})

test('protected API endpoints reject anonymous requests', async () => {
  const server = await listen()
  try {
    const { port } = server.address()
    const response = await fetch(`http://127.0.0.1:${port}/api/tasks`)
    assert.equal(response.status, 401)
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
})
