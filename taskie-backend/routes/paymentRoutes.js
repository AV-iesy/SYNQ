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

// Razorpay
router.post('/create-order', protect, createOrder)
router.post('/verify', protect, verifyPayment)
router.get('/status', protect, getStatus)

// PayPal
router.get('/paypal/config', protect, getPayPalConfig)
router.post('/paypal/create-order', protect, createPayPalOrder)
router.post('/paypal/capture', protect, capturePayPalOrder)

module.exports = router
