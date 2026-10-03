const Razorpay = require('razorpay')
const crypto = require('crypto')
const paypal = require('@paypal/checkout-server-sdk')
const User = require('../models/User')
const PaymentRecord = require('../models/PaymentRecord')
const { isMissing } = require('../utils/config')
const { hasPremiumAccess, getAccessSource } = require('../utils/access')

const VALID_PLANS = new Set(['monthly', 'lifetime'])

function requireConfig(names) {
  const missing = names.filter(isMissing)
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
  const validAmount = currency === 'INR'
    ? Number.isInteger(value) && value <= 100000000
    : Number.isFinite(value) && value <= 1000000
  return validAmount && value > 0 ? value : null
}

function getRazorpayClient() {
  requireConfig(['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'])
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
}

function getPayPalClient() {
  requireConfig(['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET', 'PAYPAL_MODE'])
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

function premiumUpdate(plan, provider, paymentId, purchasedPlan = plan, expiryBase = new Date()) {
  const paidAt = new Date()
  return {
    $set: {
      isPremium: true,
      premiumPlan: plan,
      premiumSince: paidAt,
      premiumExpiry: plan === 'monthly' ? addOneMonth(expiryBase) : null,
    },
    $push: { paymentHistory: { provider, paymentId, plan: purchasedPlan, paidAt } },
  }
}

function paymentUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    hasPremiumAccess: hasPremiumAccess(user),
    accessSource: getAccessSource(user),
    isPremium: user.isPremium,
    premiumPlan: user.premiumPlan,
    premiumExpiry: user.premiumExpiry,
  }
}

function errorResponse(res, error, fallback) {
  console.error({
    event: 'payment_error',
    operation: fallback,
    name: error?.name,
    code: error?.code,
    status: error?.statusCode,
    message: error?.message,
  })
  const status = Number.isInteger(error?.statusCode) ? error.statusCode : 500
  res.status(status).json({ error: status < 500 ? 'Payment request rejected' : fallback })
}

function isProviderId(value) {
  return typeof value === 'string' && value.length >= 1 && value.length <= 160 && /^[A-Za-z0-9_-]+$/.test(value)
}

async function fulfillPayment(record, paymentId) {
  let claimed = record
  if (record.status === 'created') {
    try {
      claimed = await PaymentRecord.findOneAndUpdate(
        { _id: record._id, user: record.user, status: 'created' },
        { $set: { status: 'verified', paymentId, verifiedAt: new Date() } },
        { new: true, runValidators: true }
      )
    } catch (error) {
      if (error.code === 11000) {
        error.statusCode = 409
        throw error
      }
      throw error
    }
  }

  if (!claimed) claimed = await PaymentRecord.findById(record._id)
  if (!claimed || claimed.paymentId !== paymentId || !['verified', 'fulfilled'].includes(claimed.status)) {
    const error = new Error('Payment record conflict')
    error.statusCode = 409
    throw error
  }

  const currentUser = await User.findById(claimed.user).select('isPremium premiumPlan premiumExpiry')
  if (!currentUser) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }
  const keepLifetime = currentUser.isPremium && currentUser.premiumPlan === 'lifetime'
  const entitlementPlan = keepLifetime ? 'lifetime' : claimed.plan
  const expiryBase = currentUser.isPremium && currentUser.premiumPlan === 'monthly' &&
    currentUser.premiumExpiry > new Date() ? currentUser.premiumExpiry : new Date()

  let user = await User.findOneAndUpdate(
    {
      _id: claimed.user,
      paymentHistory: { $not: { $elemMatch: { provider: claimed.provider, paymentId } } },
    },
    premiumUpdate(entitlementPlan, claimed.provider, paymentId, claimed.plan, expiryBase),
    { new: true, runValidators: true }
  )
  if (!user) user = await User.findById(claimed.user)
  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  await PaymentRecord.updateOne(
    { _id: claimed._id, paymentId },
    { $set: { status: 'fulfilled', fulfilledAt: new Date() } }
  )
  return user
}

exports.createOrder = async (req, res) => {
  try {
    const { plan } = req.body || {}
    const amount = getPlanPrice(plan, 'INR')
    if (!amount) return res.status(400).json({ error: 'Invalid plan or price configuration' })

    const order = await getRazorpayClient().orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-10)}`,
      notes: { userId: req.user._id.toString(), plan },
    })
    await PaymentRecord.create({
      user: req.user._id,
      provider: 'razorpay',
      providerOrderId: order.id,
      plan,
      currency: 'INR',
      amount,
    })
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID })
  } catch (error) {
    errorResponse(res, error, 'Failed to create payment order')
  }
}

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {}
    if (!isProviderId(orderId) || !isProviderId(paymentId) || typeof signature !== 'string' || !/^[a-f\d]{64}$/i.test(signature)) {
      return res.status(400).json({ error: 'Missing payment verification details' })
    }

    const record = await PaymentRecord.findOne({
      user: req.user._id,
      provider: 'razorpay',
      providerOrderId: orderId,
    })
    if (!record) return res.status(400).json({ error: 'Unknown payment order' })

    requireConfig(['RAZORPAY_KEY_SECRET'])
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest()
    const provided = Buffer.from(signature, 'hex')
    if (!crypto.timingSafeEqual(provided, expected)) {
      return res.status(400).json({ error: 'Invalid payment signature' })
    }

    const razorpay = getRazorpayClient()
    const [order, payment] = await Promise.all([
      razorpay.orders.fetch(orderId),
      razorpay.payments.fetch(paymentId),
    ])
    const plan = record.plan
    const expectedAmount = getPlanPrice(plan, 'INR')
    const validPayment = VALID_PLANS.has(plan) &&
      order.notes?.userId === req.user._id.toString() &&
      payment.order_id === orderId &&
      payment.status === 'captured' &&
      payment.currency === 'INR' &&
      payment.amount === expectedAmount &&
      order.amount === expectedAmount &&
      record.currency === 'INR' &&
      record.amount === expectedAmount
    if (!validPayment) return res.status(400).json({ error: 'Payment details do not match the order' })

    const user = await fulfillPayment(record, paymentId)
    res.json({ success: true, message: 'Payment verified successfully', user: paymentUser(user) })
  } catch (error) {
    errorResponse(res, error, 'Failed to verify payment')
  }
}

exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('role isPremium premiumPlan premiumExpiry premiumSince')
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.isPremium && user.premiumPlan === 'monthly' && user.premiumExpiry && user.premiumExpiry <= new Date()) {
      await User.findByIdAndUpdate(req.user._id, { isPremium: false, premiumPlan: null, premiumExpiry: null })
      user.isPremium = false
      user.premiumPlan = null
      user.premiumExpiry = null
    }
    res.json({
      isPremium: Boolean(user.isPremium),
      hasPremiumAccess: hasPremiumAccess(user),
      accessSource: getAccessSource(user),
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
    const { plan } = req.body || {}
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
    await PaymentRecord.create({
      user: req.user._id,
      provider: 'paypal',
      providerOrderId: order.result.id,
      plan,
      currency: 'USD',
      amount,
    })
    res.json({ orderId: order.result.id })
  } catch (error) {
    errorResponse(res, error, 'Failed to create PayPal order')
  }
}

exports.capturePayPalOrder = async (req, res) => {
  try {
    const { orderId } = req.body || {}
    if (!isProviderId(orderId)) return res.status(400).json({ error: 'Order id is required' })

    const record = await PaymentRecord.findOne({
      user: req.user._id,
      provider: 'paypal',
      providerOrderId: orderId,
    })
    if (!record) return res.status(400).json({ error: 'Unknown payment order' })
    if (['verified', 'fulfilled'].includes(record.status) && record.paymentId) {
      const user = await fulfillPayment(record, record.paymentId)
      return res.json({ success: true, message: 'PayPal payment captured successfully', user: paymentUser(user) })
    }

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
      Number.parseFloat(captured.amount?.value) === expectedAmount &&
      record.plan === plan &&
      record.currency === 'USD' &&
      record.amount === expectedAmount
    if (!validPayment) return res.status(400).json({ error: 'Payment details do not match the order' })

    const paymentId = captured.id
    const user = await fulfillPayment(record, paymentId)
    res.json({ success: true, message: 'PayPal payment captured successfully', user: paymentUser(user) })
  } catch (error) {
    errorResponse(res, error, 'Failed to capture PayPal payment')
  }
}
