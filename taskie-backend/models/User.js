const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const { hasPremiumAccess } = require('../utils/access')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  tokenVersion: { type: Number, default: 0, select: false },
  role: {
    type: String,
    enum: ['user', 'superadmin'],
    default: 'user',
    index: true,
  },
  preferences: {
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
    defaultWakeTime: { type: String, default: '06:00' },
    defaultSleepTime: { type: String, default: '22:30' },
  },
  stats: {
    bestStreak: { type: Number, default: 0 },
    totalTasksCompleted: { type: Number, default: 0 },
    totalStudyHours: { type: Number, default: 0 },
  },
  isPremium: { type: Boolean, default: false },
  premiumPlan: { type: String, enum: ['monthly', 'lifetime'], default: null },
  premiumSince: { type: Date, default: null },
  premiumExpiry: { type: Date, default: null },
  paymentHistory: [{
    provider: { type: String, enum: ['razorpay', 'paypal'], required: true },
    paymentId: { type: String, required: true },
    plan: { type: String, enum: ['monthly', 'lifetime'], required: true },
    paidAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true })

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.hasPremiumAccess = function () {
  return hasPremiumAccess(this)
}

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role || 'user',
    hasPremiumAccess: this.hasPremiumAccess(),
    preferences: this.preferences,
    stats: this.stats,
    isPremium: this.isPremium || false,
    premiumPlan: this.premiumPlan || null,
    premiumSince: this.premiumSince || null,
    premiumExpiry: this.premiumExpiry || null,
    createdAt: this.createdAt,
  }
}
module.exports = mongoose.model('User', userSchema)
