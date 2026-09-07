const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'partial'],
    default: 'pending',
  },
  tag: {
    type: String,
    enum: ['general', 'wake', 'sleep', 'gym', 'workout', 'work', 'study', 'meal', 'personal', 'break', 'health'],
    default: 'general',
    trim: true,
    maxlength: 50,
  },
  date: {
    type: String, // YYYY-MM-DD, which day this task belongs to
    required: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.user
      delete ret.__v
      return ret
    },
  },
})

taskSchema.index({ user: 1, date: 1 })

module.exports = mongoose.model('Task', taskSchema)
