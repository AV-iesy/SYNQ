const Task = require('../models/Task')

exports.getTasksByDate = async (req, res) => {
  try {
    const { date } = req.params
    const tasks = await Task.find({ user: req.user._id, date }).sort({ createdAt: 1 })
    res.json({ tasks })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.createTask = async (req, res) => {
  try {
    const { title, tag, date } = req.body

    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' })
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      tag: tag || 'general',
      date,
    })

    res.status(201).json({ task })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const task = await Task.findOne({ _id: id, user: req.user._id })

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (req.body.status) task.status = req.body.status
    if (req.body.title) task.title = req.body.title
    if (req.body.tag) task.tag = req.body.tag

    await task.save()
    res.json({ task })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params
    await Task.findOneAndDelete({ _id: id, user: req.user._id })
    res.json({ message: 'Task deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

exports.deleteAllTasksByDate = async (req, res) => {
  try {
    const { date } = req.params
    await Task.deleteMany({ user: req.user._id, date })
    res.json({ message: 'All tasks cleared for this date' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
