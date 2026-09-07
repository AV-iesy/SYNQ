const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { isValidTime } = require('../utils/validation')
const { sendError } = require('../utils/http')
const { getJwtSignOptions } = require('../utils/config')
const bcrypt = require('bcryptjs')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const DUMMY_PASSWORD_HASH = '$2b$10$7EqJtq98hPqEX7fNZaFWoO5xE4iJ/ePi5vmo29hYw6Qv9fU42pGai'

const generateToken = (user) => {
  return jwt.sign({ id: user._id.toString(), ver: user.tokenVersion || 0 }, process.env.JWT_SECRET, {
    ...getJwtSignOptions(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body || {}

    if (![name, email, password].every(value => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ message: 'Please provide name, email, and password' })
    }

    if (name.trim().length > 100 || email.trim().length > 254 || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address' })
    }

    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ message: 'Password must be 8-72 bytes' })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password })
    const token = generateToken(user)

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
    const { email, password } = req.body || {}

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password ||
      email.trim().length > 254 || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ message: 'Please provide email and password' })
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password +tokenVersion')
    if (!user) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH)
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user)

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

exports.logout = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id, tokenVersion: req.user.tokenVersion || 0 },
      { $inc: { tokenVersion: 1 } }
    )
    res.status(204).end()
  } catch (error) {
    sendError(res, error)
  }
}

exports.updatePreferences = async (req, res) => {
  try {
    const { theme, defaultWakeTime, defaultSleepTime } = req.body || {}

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
