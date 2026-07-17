const jwt = require('jsonwebtoken')
const User = require('../models/User')

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const user = await User.create({ name, email, password })
    const token = generateToken(user._id)

    res.status(201).json({
      token,
      user: user.toSafeObject(),
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' })
    }
    console.error('Register error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
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
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject() })
}

exports.updatePreferences = async (req, res) => {
  try {
    const { theme, defaultWakeTime, defaultSleepTime } = req.body

    if (theme) req.user.preferences.theme = theme
    if (defaultWakeTime) req.user.preferences.defaultWakeTime = defaultWakeTime
    if (defaultSleepTime) req.user.preferences.defaultSleepTime = defaultSleepTime

    await req.user.save()
    res.json({ user: req.user.toSafeObject() })
  } catch (error) {
    console.error('Update preferences error:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
