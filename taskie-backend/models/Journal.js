const mongoose = require('mongoose')

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'low', 'rough', null],
    default: null,
  },
  text: {
    type: String,
    default: '',
    maxlength: 20000,
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

journalSchema.index({ user: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('Journal', journalSchema)
