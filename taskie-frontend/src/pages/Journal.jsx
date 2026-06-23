import { useState, useEffect, useRef } from 'react'
import AppLayout from '../components/common/AppLayout'
import { useTheme } from '../context/ThemeContext'
import * as journalApi from '../api/journal'
import * as scheduleApi from '../api/schedule'
import { usePageTransition } from '../context/PageTransitionContext'

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

function MoodDropdown({ value, onChange, faint, text, subtle, cardBg, dark }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = MOODS.find(m => m.key === value)

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', width: '240px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
          backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${selected ? selected.color + '55' : faint}`,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selected && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: selected.color }} />}
          <span style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', color: selected ? selected.color : subtle }}>
            {selected ? selected.label : "Select today's mood"}
          </span>
        </span>
        <span style={{ color: subtle, fontSize: '10px', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
      </button>

      <div style={{
        position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
        backgroundColor: cardBg, border: `1px solid ${faint}`, borderRadius: '12px',
        overflow: 'hidden', zIndex: 20,
        maxHeight: open ? '220px' : '0px',
        opacity: open ? 1 : 0,
        transform: open ? 'translateY(0)' : 'translateY(-6px)',
        transition: 'max-height 0.25s ease, opacity 0.2s ease, transform 0.2s ease',
        boxShadow: open ? '0 12px 30px rgba(0,0,0,0.35)' : 'none',
      }}>
        {MOODS.map(m => (
          <button
            key={m.key}
            onClick={() => { onChange(m.key); setOpen(false) }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', textAlign: 'left', cursor: 'pointer',
              backgroundColor: value === m.key ? `${m.color}1a` : 'transparent',
              border: 'none', borderBottom: `1px solid ${faint}`,
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = `${m.color}1a`}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = value === m.key ? `${m.color}1a` : 'transparent'}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: m.color }} />
            <span style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', color: text }}>{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Journal() {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const { reportReady } = usePageTransition()

  const today = new Date()
  const todayKey = today.toISOString().split('T')[0]

  const [entries, setEntries] = useState({})
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
    padding: '18px',
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
    reportReady()
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

  const entryList = Object.values(entries).sort((a, b) => b.date.localeCompare(a.date))

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
  return <AppLayout><div /></AppLayout>
}

  return (
    <AppLayout>
      <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ marginBottom: '14px', flexShrink: 0 }}>
          <p style={{ fontSize: '12px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '2px' }}>
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '28px', fontWeight: 700, color: text, letterSpacing: '-0.8px' }}>
            <span style={{ color: '#ff4d00' }}>Journal</span>
          </h1>
        </div>

        {/* Bento grid */}
        <div style={{
          flex: 1, minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gridTemplateRows: '1fr 200px',
          gap: '14px',
        }}>

          {/* Entry editor — spans both rows on the left */}
          <div style={{ ...card(), gridRow: '1 / 3', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexShrink: 0 }}>
              <div>
                <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '16px', fontWeight: 600, color: text, letterSpacing: '-0.3px' }}>
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
                    padding: '7px 12px', borderRadius: '8px', fontSize: '11px',
                    fontFamily: 'Inter, sans-serif', fontWeight: 500, cursor: 'pointer',
                    backgroundColor: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.25)',
                    color: '#ff4d00', whiteSpace: 'nowrap',
                  }}
                >
                  ✦ AI draft from today
                </button>
              )}
            </div>

            {isToday ? (
              <div style={{ marginBottom: '12px', flexShrink: 0 }}>
                <MoodDropdown value={draftMood} onChange={setDraftMood} faint={faint} text={text} subtle={subtle} cardBg={cardBg} dark={dark} />
              </div>
            ) : (
              draftMood && (
                <div style={{ marginBottom: '12px', flexShrink: 0 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '100px',
                    backgroundColor: `${MOODS.find(m => m.key === draftMood)?.color}1a`,
                    border: `1px solid ${MOODS.find(m => m.key === draftMood)?.color}44`,
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: MOODS.find(m => m.key === draftMood)?.color }} />
                    <span style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif', color: MOODS.find(m => m.key === draftMood)?.color }}>
                      {MOODS.find(m => m.key === draftMood)?.label}
                    </span>
                  </span>
                </div>
              )
            )}

            <textarea
              value={draftText}
              onChange={e => setDraftText(e.target.value)}
              placeholder="Write about your day..."
              style={{
                width: '100%', flex: 1, padding: '14px', borderRadius: '12px',
                fontSize: '13px', fontFamily: 'Inter, sans-serif', lineHeight: '1.7',
                backgroundColor: inputBg, border: `1px solid ${faint}`,
                color: text, outline: 'none', resize: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#ff4d00'}
              onBlur={e => e.target.style.borderColor = faint}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', flexShrink: 0 }}>
              <span style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif' }}>
                {draftText.length} characters
              </span>
              <button
                onClick={handleSave}
                disabled={!draftText.trim() && !draftMood}
                style={{
                  padding: '9px 20px', borderRadius: '10px', fontSize: '12px',
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

          {/* Mini calendar — top right */}
          <div style={{ ...card(), display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexShrink: 0 }}>
              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '13px', fontWeight: 600, color: text }}>
                {MONTHS[calMonth]} {calYear}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={prevMonth} style={{ width: '22px', height: '22px', borderRadius: '6px', border: `1px solid ${faint}`, backgroundColor: 'transparent', color: subtle, cursor: 'pointer', fontSize: '10px' }}>←</button>
                <button onClick={nextMonth} style={{ width: '22px', height: '22px', borderRadius: '6px', border: `1px solid ${faint}`, backgroundColor: 'transparent', color: subtle, cursor: 'pointer', fontSize: '10px' }}>→</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '4px', flexShrink: 0 }}>
              {DAYS.map((d, i) => (
                <div key={i} style={{ textAlign: 'center', fontSize: '8px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{d}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', flex: 1 }}>
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
                      aspectRatio: '1', borderRadius: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontFamily: 'Inter, sans-serif',
                      color: mood ? mood.color : (isTodayCell ? text : subtle),
                      backgroundColor: mood ? mood.color + '1a' : 'transparent',
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

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px', flexShrink: 0 }}>
              {MOODS.map(m => (
                <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: m.color }} />
                  <span style={{ fontSize: '8px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Past entries — bottom right */}
          <div style={{ ...card(), display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '13px', fontWeight: 600, color: text, marginBottom: '10px', flexShrink: 0 }}>
              Past entries
            </div>
            {entryList.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: subtle, fontSize: '11px', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
                No entries yet
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {entryList.slice(0, 8).map(entry => {
                  const mood = MOODS.find(m => m.key === entry.mood)
                  const dateObj = new Date(entry.date + 'T12:00:00')
                  return (
                    <div
                      key={entry.date}
                      onClick={() => selectDate(entry.date)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 10px', borderRadius: '8px',
                        backgroundColor: selectedDate === entry.date ? (dark ? 'rgba(255,77,0,0.06)' : 'rgba(255,77,0,0.04)') : 'transparent',
                        border: `1px solid ${selectedDate === entry.date ? 'rgba(255,77,0,0.25)' : faint}`,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 600, color: text, minWidth: '42px' }}>
                        {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      {mood && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: mood.color, flexShrink: 0 }} />}
                      <div style={{ flex: 1, fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {entry.text || 'No written entry'}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(entry.date) }}
                        style={{ background: 'none', border: 'none', color: subtle, cursor: 'pointer', fontSize: '12px', opacity: 0.4, flexShrink: 0 }}
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
