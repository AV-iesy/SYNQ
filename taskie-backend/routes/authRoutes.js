const express = require('express')
const router = express.Router()
const { register, login, logout, getMe, updatePreferences } = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { authLimiter, registrationLimiter } = require('../middleware/security')

router.post('/register', registrationLimiter, register)
router.post('/login', authLimiter, login)
router.post('/logout', protect, logout)
router.get('/me', protect, getMe)
router.put('/preferences', protect, updatePreferences)

module.exports = router
