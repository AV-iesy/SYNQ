const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const { aiLimiter } = require('../middleware/security')
const {
  getScheduleByDate, saveSchedule, deleteSchedule, getAllSchedules, generateSchedule,
} = require('../controllers/scheduleController')

router.use(protect)
router.post('/generate', aiLimiter, generateSchedule)
router.get('/', getAllSchedules)
router.get('/:date', getScheduleByDate)
router.post('/', saveSchedule)
router.delete('/:date', deleteSchedule)

module.exports = router
