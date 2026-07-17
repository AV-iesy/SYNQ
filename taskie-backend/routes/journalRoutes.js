const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const {
  getAllEntries, getEntryByDate, saveEntry, deleteEntry,
} = require('../controllers/journalController')

router.use(protect)
router.get('/', getAllEntries)
router.get('/:date', getEntryByDate)
router.post('/', saveEntry)
router.delete('/:date', deleteEntry)

module.exports = router
