const Journal = require('../models/Journal')
const { isValidDateKey, parsePageOptions } = require('../utils/validation')
const { sendError } = require('../utils/http')

exports.getAllEntries = async (req, res) => {
  try {
    const { limit, skip, page } = parsePageOptions(req.query)
    const entries = await Journal.find({ user: req.user._id }).select('-user -__v').sort({ date: -1 }).skip(skip).limit(limit).lean()
    res.json({ entries, page, limit })
  } catch (error) {
    sendError(res, error)
  }
}

exports.getEntryByDate = async (req, res) => {
  try {
    const { date } = req.params
    if (!isValidDateKey(date)) return res.status(400).json({ message: 'Invalid date' })
    const entry = await Journal.findOne({ user: req.user._id, date })
    res.json({ entry: entry || null })
  } catch (error) {
    sendError(res, error)
  }
}

exports.saveEntry = async (req, res) => {
  try {
    const { date, mood, text } = req.body || {}

    if (!isValidDateKey(date)) {
      return res.status(400).json({ message: 'Date is required' })
    }

    if (mood !== undefined && mood !== null && !['great', 'good', 'okay', 'low', 'rough'].includes(mood)) {
      return res.status(400).json({ message: 'Invalid mood' })
    }
    if (text !== undefined && typeof text !== 'string') {
      return res.status(400).json({ message: 'Text must be a string' })
    }
    if (typeof text === 'string' && text.length > 20000) {
      return res.status(400).json({ message: 'Journal text is too long' })
    }

    const update = { user: req.user._id, date }
    if (mood !== undefined) update.mood = mood
    if (text !== undefined) update.text = text

    const entry = await Journal.findOneAndUpdate(
      { user: req.user._id, date },
      { $set: update },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    )

    res.json({ entry })
  } catch (error) {
    sendError(res, error)
  }
}

exports.deleteEntry = async (req, res) => {
  try {
    const { date } = req.params
    if (!isValidDateKey(date)) return res.status(400).json({ message: 'Invalid date' })
    const entry = await Journal.findOneAndDelete({ user: req.user._id, date })
    if (!entry) return res.status(404).json({ message: 'Entry not found' })
    res.json({ message: 'Entry deleted' })
  } catch (error) {
    sendError(res, error)
  }
}
