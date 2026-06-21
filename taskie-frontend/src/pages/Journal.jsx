import { useState, useEffect } from 'react'
import AppLayout from '../components/common/AppLayout'
import { useTheme } from '../context/ThemeContext'
import * as journalApi from '../api/journal'
import * as scheduleApi from '../api/schedule'
import LoadingSplash from '../components/common/LoadingSplash'

const MOODS = [
  { key: 'great', label: 'Great', color: '#ff4d00' },
  { key: 'good', label: 'Good', color: '#5aad7a' },
  { key: 'okay', label: 'Okay', color: '#4a90d9' },
  { key: 'low', label: 'Low', color: '#8b6bc7' },
  { key: 'rough', label: 'Rough', color: '#888' },
]

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['S','M','T','W','T','F','S']

function buildAIDraft(blocks) {
  if (!blocks || blocks.length === 0) {
    return "Today didn't have a saved schedule yet — but here's a moment to reflect on how the day went anyway."
  }
  const activities = blocks
    .filter(b => !['sleep', 'wake', 'break'].includes(b.tag))
    .map(b => b.label.toLowerCase())

  if (activities.length === 0) {
    return "Today was a quieter day — mostly rest, sleep, and downtime."
  }

  const list = activities.length === 1
    ? activities[0]
    : activities.slice(0, -1).join(', ') + ' and ' + activities[activities.length - 1]

  return `Today I worked through ${list}. `
}

export default function Journal() {
  const { theme } = useTheme()
  const dark = theme === 'dark'

  const today = new Date()
  const todayKey = today.toISOString().split('T')[0]

  const [entries, setEntries] = useState({}) // keyed by date
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [draftMood, setDraftMood] = useState(null)
  const [draftText, setDraftText] = useState('')
  const [saved, setSaved] = useState(false)
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [calYear, setCalYear] = useState(today.getFullYear())

  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  const faint = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const cardBg = dark ? '#161616' : '#ffffff'
  const hoverBorder = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)'
  const inputBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'

  const card = (extra = {}) => ({
    backgroundColor: cardBg,
    border: `1px solid ${faint}`,
    borderRadius: '16px',
    padding: '24px',
    ...extra,
  })

  const isToday = selectedDate === todayKey

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    setLoading(true)
    try {
      const list = await journalApi.getAllEntries()
      const byDate = {}
      list.forEach(e => { byDate[e.date] = e })
      setEntries(byDate)
      setDraftMood(byDate[todayKey]?.mood || null)
      setDraftText(byDate[todayKey]?.text || '')
    } catch (err) {
      console.error('Failed to load journal entries:', err)
    } finally {
      setLoading(false)
    }
  }

  const selectDate = (dateKey) => {
    setSelectedDate(dateKey)
    setDraftMood(entries[dateKey]?.mood || null)
    setDraftText(entries[dateKey]?.text || '')
  }

  const handleAIDraft = async () => {
    try {
      const scheduleData = await scheduleApi.getSchedule(todayKey)
      setDraftText(buildAIDraft(scheduleData?.blocks))
    } catch (err) {
      console.error('Failed to build AI draft:', err)
      setDraftText(buildAIDraft(null))
    }
  }

  const handleSave = async () => {
    try {
      const entry = await journalApi.saveEntry(selectedDate, draftMood, draftText)
      setEntries(prev => ({ ...prev, [selectedDate]: entry }))
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    } catch (err) {
      console.error('Failed to save journal entry:', err)
    }
  }

  const handleDelete = async (dateKey) => {
    try {
      await journalApi.deleteEntry(dateKey)
      setEntries(prev => {
        const updated = { ...prev }
        delete updated[dateKey]
        return updated
      })
      if (selectedDate === dateKey) {
        setDraftMood(null)
        setDraftText('')
      }
    } catch (err) {
      console.error('Failed to delete journal entry:', err)
    }
  }

  // Sorted entries list, newest first
  const entryList = Object.values(entries).sort((a, b) => b.date.localeCompare(a.date))

  // Mini calendar logic
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate()
  const getFirstDay = (y, m) => new Date(y, m, 1).getDay()
  const formatKey = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  const daysInMonth = getDaysInMonth(calYear, calMonth)
  const firstDay = getFirstDay(calYear, calMonth)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  if (loading) {
  return (
    <AppLayout>
      <LoadingSplash label="Loading your journal..." />
    </AppLayout>
  )
}

  return (
    <AppLayout>
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '45px', fontWeight: 800, color: text, letterSpacing: '-1px' }}>
          <span style={{ color: '#ff4d00' }}>Journal</span>
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', marginBottom: '16px' }}>

        {/* Entry editor */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '18px', fontWeight: 600, color: text, letterSpacing: '-0.3px' }}>
                {isToday ? "Today's entry" : new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
              {!isToday && (
                <button
                  onClick={() => selectDate(todayKey)}
                  style={{ fontSize: '11px', color: '#ff4d00', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: 0, marginTop: '2px' }}
                >
                  ← Back to today
                </button>
              )}
            </div>
            {isToday && (
              <button
                onClick={handleAIDraft}
                style={{
                  padding: '8px 14px', borderRadius: '8px', fontSize: '12px',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500, cursor: 'pointer',
                  backgroundColor: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.25)',
                  color: '#ff4d00',
                }}
              >
                ✦ AI draft from today
              </button>
            )}
          </div>

          {/* Mood pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {MOODS.map(m => (
              <button
                key={m.key}
                onClick={() => setDraftMood(m.key)}
                style={{
                  padding: '8px 16px', borderRadius: '100px', fontSize: '13px',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500, cursor: 'pointer',
                  border: `1px solid ${draftMood === m.key ? m.color + '66' : faint}`,
                  backgroundColor: draftMood === m.key ? m.color + '1f' : 'transparent',
                  color: draftMood === m.key ? m.color : subtle,
                  transition: 'all 0.15s',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Text area */}
          <textarea
            value={draftText}
            onChange={e => setDraftText(e.target.value)}
            placeholder="Write about your day..."
            rows={10}
            style={{
              width: '100%', padding: '16px', borderRadius: '12px',
              fontSize: '14px', fontFamily: 'Inter, sans-serif', lineHeight: '1.7',
              backgroundColor: inputBg, border: `1px solid ${faint}`,
              color: text, outline: 'none', resize: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#ff4d00'}
            onBlur={e => e.target.style.borderColor = faint}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
            <span style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif' }}>
              {draftText.length} characters
            </span>
            <button
              onClick={handleSave}
              disabled={!draftText.trim() && !draftMood}
              style={{
                padding: '10px 22px', borderRadius: '10px', fontSize: '13px',
                fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700,
                cursor: (!draftText.trim() && !draftMood) ? 'not-allowed' : 'pointer',
                backgroundColor: saved ? '#5aad7a' : (!draftText.trim() && !draftMood) ? faint : '#ff4d00',
                color: (!draftText.trim() && !draftMood) ? subtle : 'white',
                border: 'none', transition: 'all 0.2s',
              }}
            >
              {saved ? '✓ Saved!' : 'Save entry'}
            </button>
          </div>
        </div>

        {/* Mini calendar */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '14px', fontWeight: 600, color: text }}>
              {MONTHS[calMonth]} {calYear}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={prevMonth} style={{ width: '24px', height: '24px', borderRadius: '6px', border: `1px solid ${faint}`, backgroundColor: 'transparent', color: subtle, cursor: 'pointer', fontSize: '11px' }}>←</button>
              <button onClick={nextMonth} style={{ width: '24px', height: '24px', borderRadius: '6px', border: `1px solid ${faint}`, backgroundColor: 'transparent', color: subtle, cursor: 'pointer', fontSize: '11px' }}>→</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
            {DAYS.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: '9px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - firstDay + 1
              if (dayNum < 1 || dayNum > daysInMonth) return <div key={i} />
              const key = formatKey(calYear, calMonth, dayNum)
              const entry = entries[key]
              const mood = entry ? MOODS.find(m => m.key === entry.mood) : null
              const isSelected = selectedDate === key
              const isTodayCell = key === todayKey

              return (
                <div
                  key={i}
                  onClick={() => selectDate(key)}
                  style={{
                    aspectRatio: '1', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontFamily: 'Inter, sans-serif',
                    color: mood ? mood.color : (isTodayCell ? text : subtle),
                    backgroundColor: mood ? mood.color + '1f' : 'transparent',
                    border: isSelected ? `1.5px solid ${mood ? mood.color : '#ff4d00'}` : isTodayCell ? `1px solid ${faint}` : '1px solid transparent',
                    cursor: 'pointer',
                    fontWeight: mood || isTodayCell ? 600 : 400,
                    transition: 'all 0.12s',
                  }}
                >
                  {dayNum}
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px' }}>
            {MOODS.map(m => (
              <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: m.color }} />
                <span style={{ fontSize: '9px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Entries list */}
      <div style={card()}>
        <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '16px', fontWeight: 600, color: text, marginBottom: '16px' }}>
          Past entries
        </div>

        {entryList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: subtle, fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
            No entries yet — write your first one above
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto', paddingRight: '4px' }}>
            {entryList.map(entry => {
              const mood = MOODS.find(m => m.key === entry.mood)
              const dateObj = new Date(entry.date + 'T12:00:00')
              return (
                <div
                  key={entry.date}
                  onClick={() => selectDate(entry.date)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    padding: '14px 16px', borderRadius: '12px',
                    backgroundColor: selectedDate === entry.date ? (dark ? 'rgba(255,77,0,0.06)' : 'rgba(255,77,0,0.04)') : 'transparent',
                    border: `1px solid ${selectedDate === entry.date ? 'rgba(255,77,0,0.25)' : faint}`,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (selectedDate !== entry.date) e.currentTarget.style.borderColor = hoverBorder }}
                  onMouseLeave={e => { if (selectedDate !== entry.date) e.currentTarget.style.borderColor = faint }}
                >
                  <div style={{ minWidth: '72px', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '14px', fontWeight: 600, color: text }}>
                      {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    {mood && (
                      <span style={{
                        fontSize: '9px', padding: '2px 8px', borderRadius: '100px', marginTop: '4px', display: 'inline-block',
                        color: mood.color, backgroundColor: mood.color + '1f', border: `1px solid ${mood.color}44`,
                        fontFamily: 'Inter, sans-serif',
                      }}>
                        {mood.label}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {entry.text || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>No written entry — mood only</span>}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(entry.date) }}
                    style={{
                      background: 'none', border: 'none', color: subtle, cursor: 'pointer',
                      fontSize: '14px', opacity: 0.4, padding: '4px', flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}