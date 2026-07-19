require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const connectDB = require('./config/db')

const authRoutes = require('./routes/authRoutes')
const scheduleRoutes = require('./routes/scheduleRoutes')
const taskRoutes = require('./routes/taskRoutes')
const journalRoutes = require('./routes/journalRoutes')
const paymentRoutes = require('./routes/paymentRoutes')

const app = express()
// Trust proxy — required for Render/Railway/Vercel deployments
app.set('trust proxy', 1)
// Connect to MongoDB
connectDB()

// Middleware
app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://synq-life.vercel.app',
  ],
  credentials: true,
}))
app.use(express.json())
app.use(morgan('dev'))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 2000,
})
app.use('/api', limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/schedule', scheduleRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/journal', journalRoutes)
app.use('/api/payment', paymentRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SYNQ backend is running' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong', error: err.message })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`SYNQ backend running on port ${PORT}`)
})
