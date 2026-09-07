const Task = require('../models/Task')
const mongoose = require('mongoose')
const { isValidDateKey, parsePageOptions } = require('../utils/validation')
const { sendError } = require('../utils/http')

const VALID_STATUSES = new Set(['pending', 'completed', 'partial'])
const VALID_TAGS = new Set(['general', 'wake', 'sleep', 'gym', 'workout', 'work', 'study', 'meal', 'personal', 'break', 'health'])

exports.getAllTasks = async (req, res) => {
  try {
    const { limit, skip, page } = parsePageOptions(req.query)
    const tasks = await Task.find({ user: req.user._id }).select('-user -__v').sort({ date: -1, createdAt: 1 }).skip(skip).limit(limit).lean()
    res.json({ tasks, page, limit })
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
    const { title, tag, date } = req.body || {}

    if (typeof title !== 'string' || !title.trim() || !isValidDateKey(date)) {
      return res.status(400).json({ message: 'Title and date are required' })
    }

    if (title.trim().length > 300 || (tag !== undefined && !VALID_TAGS.has(tag))) {
      return res.status(400).json({ message: 'Invalid task fields' })
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

    const body = req.body || {}
    if (body.status !== undefined) {
      if (!VALID_STATUSES.has(body.status)) return res.status(400).json({ message: 'Invalid task status' })
      task.status = body.status
    }
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 300) {
        return res.status(400).json({ message: 'Title cannot be empty' })
      }
      task.title = body.title.trim()
    }
    if (body.tag !== undefined) {
      if (!VALID_TAGS.has(body.tag)) return res.status(400).json({ message: 'Invalid task tag' })
      task.tag = body.tag
    }

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
