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
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'partial'],
    default: 'pending',
  },
  tag: {
    type: String,
    default: 'general',
  },
  date: {
    type: String, // YYYY-MM-DD, which day this task belongs to
    required: true,
  },
}, { timestamps: true })

taskSchema.index({ user: 1, date: 1 })

module.exports = mongoose.model('Task', taskSchema)
