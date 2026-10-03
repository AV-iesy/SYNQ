export function formatLocalDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function dateRange(days, end = new Date()) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end)
    date.setDate(end.getDate() - (days - index - 1))
    return formatLocalDate(date)
  })
}

export function calendarMonth(year, month) {
  const firstDay = new Date(year, month, 1).getDay()

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, index - firstDay + 1, 12)
    return {
      key: formatLocalDate(date),
      day: date.getDate(),
      month: date.getMonth(),
      year: date.getFullYear(),
      weekday: date.getDay(),
      isCurrentMonth: date.getMonth() === month && date.getFullYear() === year,
    }
  })
}
