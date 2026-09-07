const jwt = require('jsonwebtoken')
const User = require('../models/User')
const mongoose = require('mongoose')
const { getJwtVerifyOptions } = require('../utils/config')

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const parts = authHeader.trim().split(/\s+/)
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1] || parts[1].length > 4096) {
      return res.status(401).json({ message: 'Not authorized' })
    }
    const token = parts[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET, getJwtVerifyOptions())
    if (!mongoose.isValidObjectId(decoded.id) || !Number.isInteger(decoded.ver)) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const user = await User.findById(decoded.id).select('+tokenVersion')
    if (!user || user.tokenVersion !== decoded.ver) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Not authorized' })
  }
}

module.exports = { protect }
