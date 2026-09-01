const Razorpay = require('razorpay')
const crypto = require('crypto')
const paypal = require('@paypal/checkout-server-sdk')
const User = require('../models/User')

const VALID_PLANS = new Set(['monthly', 'lifetime'])

function requireConfig(names) {
  const missing = names.filter(name => !process.env[name] || process.env[name].includes('placeholder'))
  if (missing.length) {
    const error = new Error(`Missing payment configuration: ${missing.join(', ')}`)
    error.statusCode = 503
    throw error
  }
}

function getPlanPrice(plan, currency) {
  if (!VALID_PLANS.has(plan)) return null
  const key = currency === 'INR'
    ? (plan === 'lifetime' ? 'LIFETIME_PRICE' : 'MONTHLY_PRICE')
    : (plan === 'lifetime' ? 'LIFETIME_PRICE_USD' : 'MONTHLY_PRICE_USD')
  const value = currency === 'INR'
    ? Number.parseInt(process.env[key], 10)
    : Number.parseFloat(process.env[key])
  return Number.isFinite(value) && value > 0 ? value : null
}

function getRazorpayClient() {
  requireConfig(['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'])
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
}

function getPayPalClient() {
  requireConfig(['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'])
  const Environment = process.env.PAYPAL_MODE === 'live'
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment
  return new paypal.core.PayPalHttpClient(new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  ))
}

function addOneMonth(date) {
  const expiry = new Date(date)
  expiry.setUTCMonth(expiry.getUTCMonth() + 1)
  return expiry
}

function premiumUpdate(plan, provider, paymentId) {
  const paidAt = new Date()
  return {
    $set: {
      isPremium: true,
      premiumPlan: plan,
      premiumSince: paidAt,
      premiumExpiry: plan === 'monthly' ? addOneMonth(paidAt) : null,
    },
    $push: { paymentHistory: { provider, paymentId, plan, paidAt } },
  }
}

function paymentUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    isPremium: user.isPremium,
    premiumPlan: user.premiumPlan,
    premiumExpiry: user.premiumExpiry,
  }
}

function errorResponse(res, error, fallback) {
  console.error(`${fallback}:`, error)
  res.status(error.statusCode || 500).json({ error: error.statusCode ? error.message : fallback })
}

exports.createOrder = async (req, res) => {
  try {
    const { plan } = req.body
    const amount = getPlanPrice(plan, 'INR')
    if (!amount) return res.status(400).json({ error: 'Invalid plan or price configuration' })

    const order = await getRazorpayClient().orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-10)}`,
      notes: { userId: req.user._id.toString(), plan },
    })
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID })
  } catch (error) {
    errorResponse(res, error, 'Failed to create payment order')
  }
}

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body
    if (![orderId, paymentId, signature].every(value => typeof value === 'string' && value)) {
      return res.status(400).json({ error: 'Missing payment verification details' })
    }

    requireConfig(['RAZORPAY_KEY_SECRET'])
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest()
    const provided = /^[a-f\d]+$/i.test(signature) ? Buffer.from(signature, 'hex') : Buffer.alloc(0)
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
      return res.status(400).json({ error: 'Invalid payment signature' })
    }

    const razorpay = getRazorpayClient()
    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(orderId),
      razorpay.payments.fetch(paymentId),
    ])
    const plan = order.notes?.plan
    const expectedAmount = getPlanPrice(plan, 'INR')
    const validPayment = VALID_PLANS.has(plan) &&
      order.notes?.userId === req.user._id.toString() &&
      payment.order_id === orderId &&
      payment.status === 'captured' &&
      payment.currency === 'INR' &&
      payment.amount === expectedAmount &&
      order.amount === expectedAmount
    if (!validPayment) return res.status(400).json({ error: 'Payment details do not match the order' })

    const existing = await User.findOne({ _id: req.user._id, 'paymentHistory.paymentId': paymentId })
    const user = existing || await User.findByIdAndUpdate(
      req.user._id,
      premiumUpdate(plan, 'razorpay', paymentId),
      { new: true, runValidators: true }
    )
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true, message: 'Payment verified successfully', user: paymentUser(user) })
  } catch (error) {
    errorResponse(res, error, 'Failed to verify payment')
  }
}

exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('isPremium premiumPlan premiumExpiry premiumSince')
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.isPremium && user.premiumPlan === 'monthly' && user.premiumExpiry && user.premiumExpiry <= new Date()) {
      await User.findByIdAndUpdate(req.user._id, { isPremium: false, premiumPlan: null, premiumExpiry: null })
      return res.json({ isPremium: false, premiumPlan: null, premiumExpiry: null, premiumSince: user.premiumSince })
    }
    res.json({
      isPremium: Boolean(user.isPremium),
      premiumPlan: user.premiumPlan,
      premiumExpiry: user.premiumExpiry,
      premiumSince: user.premiumSince,
    })
  } catch (error) {
    errorResponse(res, error, 'Failed to get payment status')
  }
}

exports.getPayPalConfig = (req, res) => {
  try {
    requireConfig(['PAYPAL_CLIENT_ID'])
    res.json({ clientId: process.env.PAYPAL_CLIENT_ID })
  } catch (error) {
    errorResponse(res, error, 'PayPal is not configured')
  }
}

exports.createPayPalOrder = async (req, res) => {
  try {
    const { plan } = req.body
    const amount = getPlanPrice(plan, 'USD')
    if (!amount) return res.status(400).json({ error: 'Invalid plan or price configuration' })

    const request = new paypal.orders.OrdersCreateRequest()
    request.prefer('return=representation')
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: { currency_code: 'USD', value: amount.toFixed(2) },
        description: plan === 'lifetime' ? 'SYNQ Lifetime Access' : 'SYNQ Pro Monthly',
        custom_id: `${req.user._id}:${plan}`,
      }],
      application_context: { brand_name: 'SYNQ', landing_page: 'NO_PREFERENCE', user_action: 'PAY_NOW' },
    })
    const order = await getPayPalClient().execute(request)
    res.json({ orderId: order.result.id })
  } catch (error) {
    errorResponse(res, error, 'Failed to create PayPal order')
  }
}

exports.capturePayPalOrder = async (req, res) => {
  try {
    const { orderId } = req.body
    if (typeof orderId !== 'string' || !orderId) return res.status(400).json({ error: 'Order id is required' })

    const request = new paypal.orders.OrdersCaptureRequest(orderId)
    request.requestBody({})
    const result = (await getPayPalClient().execute(request)).result
    const unit = result.purchase_units?.[0]
    const captured = unit?.payments?.captures?.[0]
    const [userId, plan] = (unit?.custom_id || '').split(':')
    const expectedAmount = getPlanPrice(plan, 'USD')
    const validPayment = result.status === 'COMPLETED' &&
      captured?.status === 'COMPLETED' &&
      userId === req.user._id.toString() &&
      VALID_PLANS.has(plan) &&
      captured.amount?.currency_code === 'USD' &&
      Number.parseFloat(captured.amount?.value) === expectedAmount
    if (!validPayment) return res.status(400).json({ error: 'Payment details do not match the order' })

    const paymentId = captured.id
    const existing = await User.findOne({ _id: req.user._id, 'paymentHistory.paymentId': paymentId })
    const user = existing || await User.findByIdAndUpdate(
      req.user._id,
      premiumUpdate(plan, 'paypal', paymentId),
      { new: true, runValidators: true }
    )
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ success: true, message: 'PayPal payment captured successfully', user: paymentUser(user) })
  } catch (error) {
    errorResponse(res, error, 'Failed to capture PayPal payment')
  }
}
