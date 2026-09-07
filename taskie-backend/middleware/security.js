const { rateLimit } = require('express-rate-limit')

const commonOptions = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ message: 'Too many requests. Please try again later.' }),
}

const globalApiLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 300 : 3000,
})

const authLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 10 : 100,
  skipSuccessfulRequests: true,
})

const registrationLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 5 : 100,
})

const aiLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 10 : 100,
  keyGenerator: req => `user:${req.user._id}`,
})

const paymentLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 30 : 300,
  keyGenerator: req => `user:${req.user._id}`,
})

function requireJson(req, res, next) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) {
    return res.status(415).json({ message: 'Content-Type must be application/json' })
  }
  next()
}

function noStore(req, res, next) {
  res.set('Cache-Control', 'no-store')
  res.set('Pragma', 'no-cache')
  next()
}

module.exports = {
  globalApiLimiter,
  authLimiter,
  registrationLimiter,
  aiLimiter,
  paymentLimiter,
  requireJson,
  noStore,
}
