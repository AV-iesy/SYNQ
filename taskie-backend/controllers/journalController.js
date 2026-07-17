const Journal = require('../models/Journal')

exports.getAllEntries = async (req, res) => {
  try {
    const entries = await Journal.find({ user: req.user._id }).sort({ date: -1 })
    res.json({ entries })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.getEntryByDate = async (req, res) => {
  try {
    const { date } = req.params
    const entry = await Journal.findOne({ user: req.user._id, date })
    res.json({ entry: entry || null })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.saveEntry = async (req, res) => {
  try {
    const { date, mood, text } = req.body

    if (!date) {
      return res.status(400).json({ message: 'Date is required' })
    }

    const entry = await Journal.findOneAndUpdate(
      { user: req.user._id, date },
      { mood, text, user: req.user._id, date },
      { upsert: true, new: true }
    )

    res.json({ entry })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.deleteEntry = async (req, res) => {
  try {
    const { date } = req.params
    await Journal.findOneAndDelete({ user: req.user._id, date })
    res.json({ message: 'Entry deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
