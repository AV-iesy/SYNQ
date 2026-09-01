const mongoose = require('mongoose')

const blockSchema = new mongoose.Schema({
  time: { type: String, required: true },
  endTime: { type: String, required: true },
  label: { type: String, required: true, trim: true, maxlength: 300 },
  tag: { type: String, trim: true, maxlength: 50 },
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
  sourceInput: { type: String, maxlength: 10000 }, // the original AI prompt text, if any
}, { timestamps: true })

scheduleSchema.index({ user: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('Schedule', scheduleSchema)
