const Task = require('../models/Task')
const mongoose = require('mongoose')
const { isValidDateKey } = require('../utils/validation')
const { sendError } = require('../utils/http')

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ date: -1, createdAt: 1 })
    res.json({ tasks })
  } catch (error) {
    sendError(res, error)
  }
}

exports.getTasksByDate = async (req, res) => {
  try {
    const { date } = req.params
    if (!isValidDateKey(date)) return res.status(400).json({ message: 'Invalid date' })
    const tasks = await Task.find({ user: req.user._id, date }).sort({ createdAt: 1 })
    res.json({ tasks })
  } catch (error) {
    sendError(res, error)
  }
}

exports.createTask = async (req, res) => {
  try {
    const { title, tag, date } = req.body

    if (typeof title !== 'string' || !title.trim() || !isValidDateKey(date)) {
      return res.status(400).json({ message: 'Title and date are required' })
    }

    const task = await Task.create({
      user: req.user._id,
      title: title.trim(),
      tag: tag || 'general',
      date,
    })

    res.status(201).json({ task })
  } catch (error) {
    sendError(res, error)
  }
}

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid task id' })
    const task = await Task.findOne({ _id: id, user: req.user._id })

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (req.body.status !== undefined) task.status = req.body.status
    if (req.body.title !== undefined) {
      if (typeof req.body.title !== 'string' || !req.body.title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty' })
      }
      task.title = req.body.title.trim()
    }
    if (req.body.tag !== undefined) task.tag = req.body.tag

    await task.save()
    res.json({ task })
  } catch (error) {
    sendError(res, error)
  }
}

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid task id' })
    const task = await Task.findOneAndDelete({ _id: id, user: req.user._id })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json({ message: 'Task deleted' })
  } catch (error) {
    sendError(res, error)
  }
}

exports.deleteAllTasksByDate = async (req, res) => {
  try {
    const { date } = req.params
    if (!isValidDateKey(date)) return res.status(400).json({ message: 'Invalid date' })
    await Task.deleteMany({ user: req.user._id, date })
    res.json({ message: 'All tasks cleared for this date' })
  } catch (error) {
    sendError(res, error)
  }
}
