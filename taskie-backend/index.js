const path = require('path')

// Local overrides load first; dotenv preserves already-defined production values.
require('dotenv').config({ path: path.join(__dirname, '.env.local'), quiet: true })
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true })

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const connectDB = require('./config/db')
const { assertRuntimeConfig } = require('./utils/config')
const { globalApiLimiter, requireJson, noStore } = require('./middleware/security')

const authRoutes = require('./routes/authRoutes')
const scheduleRoutes = require('./routes/scheduleRoutes')
const taskRoutes = require('./routes/taskRoutes')
const journalRoutes = require('./routes/journalRoutes')
const paymentRoutes = require('./routes/paymentRoutes')

const app = express()
const isProduction = process.env.NODE_ENV === 'production'
app.disable('x-powered-by')
// Hosted environments place one trusted reverse proxy in front of Express.
app.set('trust proxy', isProduction ? 1 : false)
// Middleware
app.use(helmet())
const allowedOrigins = [
  ...(!isProduction ? ['http://localhost:5173', 'http://localhost:5174'] : []),
  'https://synq-life.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    // Requests without Origin are non-browser clients and still require API auth.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    const error = new Error('Origin is not allowed')
    error.statusCode = 403
    return callback(error)
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  maxAge: 600,
}))
app.use(express.json({ limit: '64kb', strict: true }))
app.use(isProduction ? morgan('combined') : morgan('dev'))

app.use('/api', noStore, requireJson, globalApiLimiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/journal', journalRoutes)
app.use('/api/payment', paymentRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  const candidateStatus = err.statusCode || err.status
  const status = Number.isInteger(candidateStatus) && candidateStatus >= 400 && candidateStatus <= 599
    ? candidateStatus
    : 500
  console.error({
    event: 'request_error',
    method: req.method,
    path: req.path,
    status,
    name: err.name,
    message: err.message,
  })
  res.status(status).json({ message: status < 500 ? 'Request rejected' : 'Something went wrong' })
})

const PORT = process.env.PORT || 5000

async function start() {
  assertRuntimeConfig()
  await connectDB()
  return app.listen(PORT, () => {
    console.log(`SYNQ backend running on port ${PORT}`)
  })
}

if (require.main === module) {
  start().catch(() => process.exit(1))
}

module.exports = { app, start }
