const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  getAllTasks, getTasksByDate, createTask, updateTask, deleteTask, deleteAllTasksByDate,
} = require('../controllers/taskController')

router.use(protect)
router.get('/', getAllTasks)
router.get('/:date', getTasksByDate)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)
router.delete('/date/:date', deleteAllTasksByDate)

module.exports = router
