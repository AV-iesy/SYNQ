const Schedule = require('../models/Schedule')
const { isValidDateKey, isValidTime, parsePageOptions } = require('../utils/validation')
const { sendError } = require('../utils/http')

const ALLOWED_TAGS = new Set(['wake', 'sleep', 'gym', 'workout', 'work', 'study', 'meal', 'personal', 'break', 'health'])
const MAX_PROVIDER_RESPONSE_BYTES = 256 * 1024

async function readLimitedJson(response) {
  const declaredLength = Number.parseInt(response.headers.get('content-length'), 10)
  if (Number.isFinite(declaredLength) && declaredLength > MAX_PROVIDER_RESPONSE_BYTES) {
    throw new Error('AI response exceeded size limit')
  }
  const reader = response.body.getReader()
  const chunks = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_PROVIDER_RESPONSE_BYTES) {
      await reader.cancel()
      throw new Error('AI response exceeded size limit')
    }
    chunks.push(Buffer.from(value))
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function isValidGeneratedBlock(block) {
  return block && isValidTime(block.time) && isValidTime(block.endTime) &&
    typeof block.label === 'string' && block.label.trim().length > 0 && block.label.length <= 300 &&
    ALLOWED_TAGS.has(block.tag)
}

function hasValidTimeline(blocks) {
  let previousEnd = -1
  return blocks.every(block => {
    const [startHour, startMinute] = block.time.split(':').map(Number)
    const [endHour, endMinute] = block.endTime.split(':').map(Number)
    const start = startHour * 60 + startMinute
    const end = endHour * 60 + endMinute
    const valid = start >= previousEnd && end > start
    previousEnd = end
    return valid
  })
}

exports.generateSchedule = async (req, res) => {
  const input = typeof req.body?.input === 'string' ? req.body.input.trim() : ''
  if (!input || input.length > 5000) {
    return res.status(400).json({ message: 'Input must be between 1 and 5000 characters' })
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ message: 'Schedule generation is not configured' })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are SYNQ's scheduling assistant. Return only a JSON array of realistic schedule blocks. Each block must have exactly: time and endTime in 24-hour HH:MM format, a concise label, and a tag from wake, sleep, gym, workout, work, study, meal, personal, break, health. Start with waking and end with sleep; include meals and breaks where appropriate. Blocks must be chronological and must not overlap.`,
          },
          { role: 'user', content: `Create a schedule for my day: ${input}` },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Groq request failed with status ${response.status}`)
    const completion = await readLimitedJson(response)
    const raw = completion.choices?.[0]?.message?.content || ''
    const match = raw.replace(/```json|```/gi, '').match(/\[[\s\S]*\]/)
    const blocks = JSON.parse(match?.[0] || '')
    if (!Array.isArray(blocks) || blocks.length === 0 || blocks.length > 100 ||
      !blocks.every(isValidGeneratedBlock) || !hasValidTimeline(blocks)) {
      throw new Error('AI returned an invalid schedule')
    }
    res.json({
      blocks: blocks.map(block => ({
        time: block.time,
        endTime: block.endTime,
        label: block.label.trim(),
        tag: block.tag,
      })),
    })
  } catch (error) {
    console.error({
      event: 'schedule_generation_error',
      name: error?.name,
      message: error?.message,
    })
    res.status(error.name === 'AbortError' ? 504 : 502).json({ message: 'Could not generate schedule' })
  } finally {
    clearTimeout(timeout)
  }
}

exports.getScheduleByDate = async (req, res) => {
  try {
    const { date } = req.params
    if (!isValidDateKey(date)) return res.status(400).json({ message: 'Invalid date' })
    const schedule = await Schedule.findOne({ user: req.user._id, date })
    res.json({ schedule: schedule || null })
  } catch (error) {
    sendError(res, error)
  }
}

exports.saveSchedule = async (req, res) => {
  try {
    const { date, blocks, sourceInput } = req.body || {}

    if (!isValidDateKey(date) || !Array.isArray(blocks)) {
      return res.status(400).json({ message: 'Date and blocks are required' })
    }

    if (blocks.length > 100) return res.status(400).json({ message: 'Too many schedule blocks' })
    const invalidBlock = blocks.some(block => !block ||
      typeof block.label !== 'string' || !block.label.trim() ||
      block.label.length > 300 ||
      !isValidTime(block.time) || !isValidTime(block.endTime) ||
      (block.tag !== undefined && !ALLOWED_TAGS.has(block.tag)))
    if (invalidBlock) return res.status(400).json({ message: 'Invalid schedule block' })
    if (!hasValidTimeline(blocks)) return res.status(400).json({ message: 'Schedule blocks must be chronological and non-overlapping' })
    if (sourceInput !== undefined && (typeof sourceInput !== 'string' || sourceInput.length > 5000)) {
      return res.status(400).json({ message: 'Invalid source input' })
    }

    const normalizedBlocks = blocks.map(block => ({
      time: block.time,
      endTime: block.endTime,
      label: block.label.trim(),
      ...(block.tag ? { tag: block.tag } : {}),
    }))

    const schedule = await Schedule.findOneAndUpdate(
      { user: req.user._id, date },
      { $set: { blocks: normalizedBlocks, sourceInput: sourceInput || '', user: req.user._id, date } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    )

    res.json({ schedule })
  } catch (error) {
    sendError(res, error)
  }
}

exports.deleteSchedule = async (req, res) => {
  try {
    const { date } = req.params
    if (!isValidDateKey(date)) return res.status(400).json({ message: 'Invalid date' })
    const schedule = await Schedule.findOneAndDelete({ user: req.user._id, date })
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' })
    res.json({ message: 'Schedule deleted' })
  } catch (error) {
    sendError(res, error)
  }
}

exports.getAllSchedules = async (req, res) => {
  try {
    const { limit, skip, page } = parsePageOptions(req.query)
    const schedules = await Schedule.find({ user: req.user._id }).select('-user -sourceInput -__v').sort({ date: -1 }).skip(skip).limit(limit).lean()
    res.json({ schedules, page, limit })
  } catch (error) {
    sendError(res, error)
  }
}
