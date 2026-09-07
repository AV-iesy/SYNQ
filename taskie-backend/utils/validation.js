const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/

function isValidDateKey(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
}

function isValidTime(value) {
  return typeof value === 'string' && TIME_RE.test(value)
}

function isBoundedString(value, min, max, { trim = true } = {}) {
  if (typeof value !== 'string') return false
  const candidate = trim ? value.trim() : value
  return candidate.length >= min && candidate.length <= max
}

function parsePageOptions(query = {}) {
  const rawLimit = Number.parseInt(query.limit, 10)
  const rawPage = Number.parseInt(query.page, 10)
  const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 500) : 500
  const page = Number.isInteger(rawPage) ? Math.min(Math.max(rawPage, 1), 100) : 1
  return { limit, skip: (page - 1) * limit, page }
}

module.exports = { isValidDateKey, isValidTime, isBoundedString, parsePageOptions }
