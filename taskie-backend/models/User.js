const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
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
}, { timestamps: true })

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    preferences: this.preferences,
    stats: this.stats,
    createdAt: this.createdAt,
  }
}

module.exports = mongoose.model('User', userSchema)
