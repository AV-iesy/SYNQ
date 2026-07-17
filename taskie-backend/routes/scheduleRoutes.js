const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  getScheduleByDate, saveSchedule, deleteSchedule, getAllSchedules,
} = require('../controllers/scheduleController')

router.use(protect)
router.get('/', getAllSchedules)
router.get('/:date', getScheduleByDate)
router.post('/', saveSchedule)
router.delete('/:date', deleteSchedule)

module.exports = router
