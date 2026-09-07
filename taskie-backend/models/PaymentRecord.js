const mongoose = require('mongoose')

const paymentRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  provider: { type: String, enum: ['razorpay', 'paypal'], required: true },
  providerOrderId: { type: String, required: true, maxlength: 160 },
  paymentId: { type: String, maxlength: 160 },
  plan: { type: String, enum: ['monthly', 'lifetime'], required: true },
  currency: { type: String, enum: ['INR', 'USD'], required: true },
  amount: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['created', 'verified', 'fulfilled'], default: 'created' },
  verifiedAt: { type: Date, default: null },
  fulfilledAt: { type: Date, default: null },
}, { timestamps: true })

paymentRecordSchema.index({ provider: 1, providerOrderId: 1 }, { unique: true })
paymentRecordSchema.index(
  { provider: 1, paymentId: 1 },
  { unique: true, partialFilterExpression: { paymentId: { $type: 'string' } } }
)

module.exports = mongoose.model('PaymentRecord', paymentRecordSchema)
