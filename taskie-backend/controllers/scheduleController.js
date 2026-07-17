const Schedule = require('../models/Schedule')

exports.getScheduleByDate = async (req, res) => {
  try {
    const { date } = req.params
    const schedule = await Schedule.findOne({ user: req.user._id, date })
    res.json({ schedule: schedule || null })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.saveSchedule = async (req, res) => {
  try {
    const { date, blocks, sourceInput } = req.body

    if (!date || !blocks) {
      return res.status(400).json({ message: 'Date and blocks are required' })
    }

    const schedule = await Schedule.findOneAndUpdate(
      { user: req.user._id, date },
      { blocks, sourceInput, user: req.user._id, date },
      { upsert: true, new: true }
    )

    res.json({ schedule })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.deleteSchedule = async (req, res) => {
  try {
    const { date } = req.params
    await Schedule.findOneAndDelete({ user: req.user._id, date })
    res.json({ message: 'Schedule deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ user: req.user._id }).sort({ date: -1 })
    res.json({ schedules })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
