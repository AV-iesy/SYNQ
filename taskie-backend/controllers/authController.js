const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { isValidTime } = require('../utils/validation')
const { sendError } = require('../utils/http')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (![name, email, password].every(value => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ message: 'Please provide name, email, and password' })
    }

    if (!EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password })
    const token = generateToken(user._id)

    res.status(201).json({
      token,
      user: user.toSafeObject(),
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' })
    }
    sendError(res, error)
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ message: 'Please provide email and password' })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user._id)

    res.json({
      token,
      user: user.toSafeObject(),
    })
  } catch (error) {
    sendError(res, error)
  }
}

exports.getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject() })
}

exports.updatePreferences = async (req, res) => {
  try {
    const { theme, defaultWakeTime, defaultSleepTime } = req.body

    if (theme !== undefined && !['dark', 'light'].includes(theme)) {
      return res.status(400).json({ message: 'Invalid theme' })
    }
    if (defaultWakeTime !== undefined && !isValidTime(defaultWakeTime)) {
      return res.status(400).json({ message: 'Invalid wake time' })
    }
    if (defaultSleepTime !== undefined && !isValidTime(defaultSleepTime)) {
      return res.status(400).json({ message: 'Invalid sleep time' })
    }

    if (theme !== undefined) req.user.preferences.theme = theme
    if (defaultWakeTime !== undefined) req.user.preferences.defaultWakeTime = defaultWakeTime
    if (defaultSleepTime !== undefined) req.user.preferences.defaultSleepTime = defaultSleepTime

    await req.user.save()
    res.json({ user: req.user.toSafeObject() })
  } catch (error) {
    sendError(res, error)
  }
}
