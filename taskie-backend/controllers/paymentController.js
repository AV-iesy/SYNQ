const Razorpay = require('razorpay')
const crypto = require('crypto')
const User = require('../models/User')

function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder') {
    throw new Error('Razorpay keys not configured')
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

// POST /api/payment/create-order
exports.createOrder = async (req, res) => {
  try {
    const { plan } = req.body
    const amount = plan === 'lifetime'
      ? parseInt(process.env.LIFETIME_PRICE)
      : parseInt(process.env.MONTHLY_PRICE)

    const razorpay = getRazorpayClient()
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: req.user._id.toString(), plan },
    })

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('Create order error:', err)
    res.status(500).json({ error: err.message || 'Failed to create payment order' })
  }
}

// POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' })
    }

    const update = {
      isPremium: true,
      premiumPlan: plan,
      premiumSince: new Date(),
      premiumExpiry: plan === 'monthly'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null,
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password')

    res.json({
      success: true,
      message: 'Payment verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        premiumPlan: user.premiumPlan,
        premiumExpiry: user.premiumExpiry,
      }
    })
  } catch (err) {
    console.error('Verify payment error:', err)
    res.status(500).json({ error: 'Failed to verify payment' })
  }
}

// GET /api/payment/status
exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('isPremium premiumPlan premiumExpiry premiumSince')

    if (user.isPremium && user.premiumPlan === 'monthly' && user.premiumExpiry) {
      if (new Date() > new Date(user.premiumExpiry)) {
        await User.findByIdAndUpdate(req.user._id, { isPremium: false })
        return res.json({ isPremium: false })
      }
    }

    res.json({
      isPremium: user.isPremium || false,
      premiumPlan: user.premiumPlan,
      premiumExpiry: user.premiumExpiry,
      premiumSince: user.premiumSince,
    })
  } catch (err) {
    console.error('Get status error:', err)
    res.status(500).json({ error: 'Failed to get payment status' })
  }
}

// ── PayPal ────────────────────────────────────────────────────
const paypal = require('@paypal/checkout-server-sdk')

function getPayPalClient() {
  const env = process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
  return new paypal.core.PayPalHttpClient(env)
}

// POST /api/payment/paypal/create-order
exports.createPayPalOrder = async (req, res) => {
  try {
    const { plan } = req.body
    const amount = plan === 'lifetime'
      ? process.env.LIFETIME_PRICE_USD
      : process.env.MONTHLY_PRICE_USD

    const client = getPayPalClient()
    const request = new paypal.orders.OrdersCreateRequest()
    request.prefer('return=representation')
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'USD', value: amount },
        description: plan === 'lifetime' ? 'SYNQ Lifetime Access' : 'SYNQ Pro Monthly',
        custom_id: `${req.user._id}:${plan}`,
      }],
      application_context: {
        brand_name: 'SYNQ',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
      },
    })

    const order = await client.execute(request)
    res.json({
      orderId: order.result.id,
      clientId: process.env.PAYPAL_CLIENT_ID,
    })
  } catch (err) {
    console.error('PayPal create order error:', err)
    res.status(500).json({ error: 'Failed to create PayPal order' })
  }
}

// POST /api/payment/paypal/capture
exports.capturePayPalOrder = async (req, res) => {
  try {
    const { orderId, plan } = req.body

    const client = getPayPalClient()
    const request = new paypal.orders.OrdersCaptureRequest(orderId)
    request.requestBody({})

    const capture = await client.execute(request)

    if (capture.result.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Payment not completed' })
    }

    const update = {
      isPremium: true,
      premiumPlan: plan,
      premiumSince: new Date(),
      premiumExpiry: plan === 'monthly'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null,
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password')

    res.json({
      success: true,
      message: 'PayPal payment captured successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        premiumPlan: user.premiumPlan,
        premiumExpiry: user.premiumExpiry,
      }
    })
  } catch (err) {
    console.error('PayPal capture error:', err)
    res.status(500).json({ error: 'Failed to capture PayPal payment' })
  }
}
