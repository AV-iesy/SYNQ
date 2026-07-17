const mongoose = require('mongoose')

const blockSchema = new mongoose.Schema({
  time: String,
  endTime: String,
  label: String,
  tag: String,
}, { _id: false })

const scheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  blocks: [blockSchema],
  sourceInput: String, // the original AI prompt text, if any
}, { timestamps: true })

scheduleSchema.index({ user: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('Schedule', scheduleSchema)
