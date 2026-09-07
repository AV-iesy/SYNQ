const express = require('express')
const router = express.Router()
const {
  createOrder,
  verifyPayment,
  getStatus,
  createPayPalOrder,
  capturePayPalOrder,
  getPayPalConfig,
} = require('../controllers/paymentController')
const { protect } = require('../middleware/auth')
const { paymentLimiter } = require('../middleware/security')

// Razorpay
router.post('/create-order', protect, paymentLimiter, createOrder)
router.post('/verify', protect, paymentLimiter, verifyPayment)
router.get('/status', protect, getStatus)

// PayPal
router.get('/paypal/config', protect, getPayPalConfig)
router.post('/paypal/create-order', protect, paymentLimiter, createPayPalOrder)
router.post('/paypal/capture', protect, paymentLimiter, capturePayPalOrder)

module.exports = router
