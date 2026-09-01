import { useState, useEffect } from 'react'
import AppLayout from '../components/common/AppLayout'
import { useTheme } from '../context/ThemeContext'
import * as scheduleApi from '../api/schedule'
import * as taskApi from '../api/tasks'
import * as journalApi from '../api/journal'
import { usePageTransition } from '../context/PageTransitionContext'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const SHORT_MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const monthColors = [
  '#4a6fd4','#8b2252','#6b7c2e','#c0392b',
  '#c9944a','#ff4d00','#666666','#8b4fb5',
  '#1a3a8f','#7a3010','#4a90d9','#8b1a1a',
]

const MOOD_COLORS = { great: '#ff4d00', good: '#5aad7a', okay: '#4a90d9', low: '#8b6bc7', rough: '#888' }
const MOOD_LABELS = { great: 'Great', good: 'Good', okay: 'Okay', low: 'Low', rough: 'Rough' }

function StackedRings({ completionPct, tasksPct, studyPct }) {
  const size = 110, stroke = 10, gap = 8
  const rings = [
    { pct: completionPct, color: '#ff4d00', track: 'rgba(255,77,0,0.15)' },
    { pct: tasksPct, color: '#5aad7a', track: 'rgba(90,173,122,0.15)' },
    { pct: studyPct, color: '#4a90d9', track: 'rgba(74,144,217,0.15)' },
  ]
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {rings.map((ring, i) => {
        const r = (size/2) - (stroke/2) - i*(stroke+gap)
        const c = 2*Math.PI*r
        const offset = c - (ring.pct/100)*c
        return (
          <g key={i}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={ring.track} strokeWidth={stroke} />
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={ring.color} strokeWidth={stroke}
              strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </g>
        )
      })}
    </svg>
  )
}

// Build a date -> {level, completed, total, focusMinutes, completionPct} map from real schedules + tasks
function buildHistoryData(schedules, tasks) {
  const data = {}

  const tasksByDate = {}
  tasks.forEach(t => {
    if (!tasksByDate[t.date]) tasksByDate[t.date] = []
    tasksByDate[t.date].push(t)
  })

  schedules.forEach(s => {
    const focusMinutes = (s.blocks || [])
      .filter(b => b.tag === 'study' || b.tag === 'work')
      .reduce((total, b) => {
        const [sh, sm] = b.time.split(':').map(Number)
        const [eh, em] = b.endTime.split(':').map(Number)
        return total + ((eh * 60 + em) - (sh * 60 + sm))
      }, 0)

    const dayTasks = tasksByDate[s.date] || []
    const completedTasks = dayTasks.filter(t => t.status === 'completed')
    const total = dayTasks.length
    const completionPct = total === 0 ? 0 : Math.round((completedTasks.length / total) * 100)

    let level = 1
    if (completionPct >= 80) level = 4
    else if (completionPct >= 50) level = 3
    else if (completionPct > 0) level = 2

    data[s.date] = {
      level,
      completed: completedTasks.map(t => t.title),
      total: total || (s.blocks?.length || 0),
      focusMinutes,
      completionPct,
    }
  })

  Object.keys(tasksByDate).forEach(date => {
    if (data[date]) return
    const dayTasks = tasksByDate[date]
    const completedTasks = dayTasks.filter(t => t.status === 'completed')
    const completionPct = Math.round((completedTasks.length / dayTasks.length) * 100)
    let level = 1
    if (completionPct >= 80) level = 4
    else if (completionPct >= 50) level = 3
    else if (completionPct > 0) level = 2

    data[date] = {
      level,
      completed: completedTasks.map(t => t.title),
      total: dayTasks.length,
      focusMinutes: 0,
      completionPct,
    }
  })

  return data
}

export default function Calendar() {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const { reportReady } = usePageTransition()

  const today = new Date()
  const getInitialNav = () => {
    try {
      const raw = localStorage.getItem('synq-calendar-nav')
      if (!raw) return null
      const parsed = JSON.parse(raw)
      localStorage.removeItem('synq-calendar-nav')
      return parsed
    } catch { return null }
  }
  const nav = getInitialNav()

  const [currentYear, setCurrentYear] = useState(nav?.year || today.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(typeof nav?.month === 'number' ? nav.month : today.getMonth())
  const [selectedDay, setSelectedDay] = useState(nav?.date || null)
  const [view, setView] = useState(nav ? 'month' : 'year')
  const [historyData, setHistoryData] = useState({})
  const [journalEntries, setJournalEntries] = useState({})
  const [loading, setLoading] = useState(true)

  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
  const faint = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const cardBg = dark ? '#161616' : '#ffffff'
  const cellBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'

  const accent = monthColors[currentMonth]

  useEffect(() => {
    let cancelled = false
    const loadHistory = async () => {
      setLoading(true)
      try {
        const [schedules, journalList, allTasks] = await Promise.all([
          scheduleApi.getAllSchedules(),
          journalApi.getAllEntries(),
          taskApi.getAllTasks(),
        ])
        if (cancelled) return
        const jByDate = {}
        ;(journalList || []).forEach(entry => { jByDate[entry.date] = entry })
        setJournalEntries(jByDate)
        setHistoryData(buildHistoryData(schedules, allTasks || []))
      } catch (err) {
        console.error('Failed to load Calendar history:', err)
      } finally {
        if (!cancelled) {
          setLoading(false)
          reportReady()
        }
      }
    }
    loadHistory()
    return () => { cancelled = true }
  }, [reportReady])

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate()
  const getFirstDay = (y, m) => new Date(y, m, 1).getDay()
  const formatKey = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`

  const getLevelBg = (level, mIdx) => {
    if (!level) return cellBg
    const col = monthColors[mIdx]
    const opacity = ['','28','55','99','ff'][level]
    return `${col}${opacity}`
  }

  // ── YEAR VIEW ──────────────────────────────────────────────
  const YearView = () => (
    <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => setCurrentYear(y => y-1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${faint}`, backgroundColor: 'transparent', color: subtle, cursor: 'pointer', fontSize: '14px' }}>←</button>
          <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '32px', fontWeight: 700, color: text, letterSpacing: '-1px' }}>{currentYear}</h1>
          <button onClick={() => setCurrentYear(y => y+1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${faint}`, backgroundColor: 'transparent', color: subtle, cursor: 'pointer', fontSize: '14px' }}>→</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flex: 1 }}>
        {Array.from({ length: 12 }, (_, mi) => {
          const col = monthColors[mi]
          const daysInMonth = getDaysInMonth(currentYear, mi)
          const firstDay = getFirstDay(currentYear, mi)
          const isCurrentMonth = mi === today.getMonth() && currentYear === today.getFullYear()

          return (
            <div
              key={mi}
              onClick={() => { setCurrentMonth(mi); setSelectedDay(null); setView('month') }}
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${isCurrentMonth ? col : faint}`,
                borderRadius: '14px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.15s, border-color 0.15s',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = col }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = isCurrentMonth ? col : faint }}
            >
              <div style={{ backgroundColor: col, padding: '8px 12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '18px', fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>
                  {SHORT_MONTHS[mi]}
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{currentYear}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '4px 6px 0', gap: '1px', flexShrink: 0 }}>
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: '7px', color: subtle, fontFamily: 'Inter, sans-serif', padding: '2px 0' }}>{d}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '2px 6px 8px', gap: '2px', flex: 1 }}>
                {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const key = formatKey(currentYear, mi, day)
                  const data = historyData[key]
                  const isToday = day === today.getDate() && mi === today.getMonth() && currentYear === today.getFullYear()
                  return (
                    <div key={day} style={{
                      aspectRatio: '1',
                      borderRadius: '2px',
                      backgroundColor: data ? getLevelBg(data.level, mi) : (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                      border: isToday ? `1px solid ${col}` : '1px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '6px',
                      color: data ? 'rgba(255,255,255,0.8)' : subtle,
                      fontFamily: 'Inter, sans-serif',
                    }}>
                      {day}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── MONTH VIEW ─────────────────────────────────────────────
  const MonthView = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDay(currentYear, currentMonth)
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
    const selectedData = selectedDay ? historyData[selectedDay] : null
    const selectedDate = selectedDay ? new Date(selectedDay + 'T12:00:00') : null
    const selectedJournal = selectedDay ? journalEntries[selectedDay] : null

    const focusHoursDisplay = selectedData
      ? (selectedData.focusMinutes >= 60
          ? `${Math.floor(selectedData.focusMinutes / 60)}h${selectedData.focusMinutes % 60 > 0 ? ` ${selectedData.focusMinutes % 60}m` : ''}`
          : `${selectedData.focusMinutes}m`)
      : '0m'

    const focusPct = selectedData ? Math.min(100, Math.round((selectedData.focusMinutes / 240) * 100)) : 0

    const prevMonth = () => {
      if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y-1) }
      else setCurrentMonth(m => m-1)
      setSelectedDay(null)
    }
    const nextMonth = () => {
      if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y+1) }
      else setCurrentMonth(m => m+1)
      setSelectedDay(null)
    }

    return (
      <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => { setView('year'); setSelectedDay(null) }}
              style={{ padding: '7px 14px', borderRadius: '8px', border: `1px solid ${faint}`, backgroundColor: 'transparent', color: subtle, cursor: 'pointer', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}
            >
              ← All months
            </button>
            <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '32px', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1 }}>
              <span style={{ color: accent }}>{MONTHS[currentMonth]}</span>
              <span style={{ color: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', marginLeft: '10px' }}>{currentYear}</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={prevMonth} style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${faint}`, backgroundColor: 'transparent', color: subtle, cursor: 'pointer', fontSize: '14px' }}>←</button>
            <button onClick={nextMonth} style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${faint}`, backgroundColor: 'transparent', color: subtle, cursor: 'pointer', fontSize: '14px' }}>→</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px', flexShrink: 0 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: `repeat(${totalCells/7}, 1fr)`, gap: '6px', flex: 1 }}>
              {Array.from({ length: totalCells }, (_, i) => {
                const dayNum = i - firstDay + 1
                if (dayNum < 1 || dayNum > daysInMonth) return <div key={i} />
                const key = formatKey(currentYear, currentMonth, dayNum)
                const data = historyData[key]
                const isToday = dayNum === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
                const isSelected = selectedDay === key

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDay(isSelected ? null : key)}
                    style={{
                      borderRadius: '12px',
                      backgroundColor: data ? getLevelBg(data.level, currentMonth) : cellBg,
                      border: isSelected ? `2px solid ${accent}` : isToday ? `1px solid ${accent}88` : `1px solid ${faint}`,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.12s',
                      position: 'relative', gap: '3px',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '15px', fontWeight: data ? 600 : 400, color: data ? 'white' : subtle }}>{dayNum}</span>
                    {data && (
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {Array.from({ length: Math.min(data.level, 4) }, (_, j) => (
                          <div key={j} style={{ width: '3px', height: '3px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.6)' }} />
                        ))}
                      </div>
                    )}
                    {isToday && <div style={{ position: 'absolute', top: '5px', right: '6px', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: accent }} />}
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
            {selectedDay && selectedDate ? (
              <>
                <div style={{ backgroundColor: cardBg, border: `1px solid ${faint}`, borderRadius: '16px', padding: '20px' }}>
                  <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                    {DAYS[selectedDate.getDay()]}
                  </div>
                  <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '44px', fontWeight: 700, color: accent, letterSpacing: '-2px', lineHeight: 1 }}>
                    {selectedDate.getDate()}
                  </div>
                  <div style={{ fontSize: '14px', color: subtle, fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                    {MONTHS[currentMonth]} {currentYear}
                  </div>
                  {selectedData && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', padding: '5px 12px', borderRadius: '100px', backgroundColor: `${accent}22`, border: `1px solid ${accent}44` }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: accent }} />
                      <span style={{ fontSize: '10px', color: accent, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {['','Low','Medium','High','Perfect'][selectedData.level]} day
                      </span>
                    </div>
                  )}
                </div>

                {selectedData ? (
                  <>
                    <div style={{ backgroundColor: cardBg, border: `1px solid ${faint}`, borderRadius: '16px', padding: '20px' }}>
                      <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Activity</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <StackedRings
                          completionPct={selectedData.completionPct}
                          tasksPct={Math.round((selectedData.completed.length / Math.max(selectedData.total, 1)) * 100)}
                          studyPct={focusPct}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { label: 'Completion', pct: selectedData.completionPct, color: '#ff4d00' },
                            { label: 'Tasks', pct: Math.round((selectedData.completed.length / Math.max(selectedData.total, 1)) * 100), color: '#5aad7a' },
                            { label: 'Focus', pct: focusPct, color: '#4a90d9' },
                          ].map(r => (
                            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: r.color }} />
                              <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '14px', fontWeight: 600, color: r.color }}>{r.pct}%</span>
                              <span style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{r.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedJournal && (
                      <div style={{ backgroundColor: cardBg, border: `1px solid ${faint}`, borderRadius: '16px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px' }}>Journal</div>
                          {selectedJournal.mood && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '3px 10px', borderRadius: '100px',
                              backgroundColor: `${MOOD_COLORS[selectedJournal.mood]}1a`,
                              border: `1px solid ${MOOD_COLORS[selectedJournal.mood]}44`,
                            }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: MOOD_COLORS[selectedJournal.mood] }} />
                              <span style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', color: MOOD_COLORS[selectedJournal.mood] }}>
                                {MOOD_LABELS[selectedJournal.mood]}
                              </span>
                            </span>
                          )}
                        </div>
                        {selectedJournal.text ? (
                          <div style={{ fontSize: '12px', color: text, fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                            {selectedJournal.text}
                          </div>
                        ) : (
                          <div style={{ fontSize: '12px', color: subtle, fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>
                            Mood logged, no written entry
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[{ label: 'Tasks done', value: `${selectedData.completed.length}/${selectedData.total}` }, { label: 'Focus time', value: focusHoursDisplay }].map(s => (
                        <div key={s.label} style={{ padding: '14px', borderRadius: '12px', backgroundColor: cardBg, border: `1px solid ${faint}` }}>
                          <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{s.label}</div>
                          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '22px', fontWeight: 700, color: text }}>{s.value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ backgroundColor: cardBg, border: `1px solid ${faint}`, borderRadius: '16px', padding: '20px' }}>
                      <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Completed tasks</div>
                      {selectedData.completed.length === 0 ? (
                        <div style={{ fontSize: '12px', color: subtle, fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>No tasks completed</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {selectedData.completed.map((task, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${faint}` }}>
                              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: accent, flexShrink: 0 }} />
                              <span style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', color: text }}>{task}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ backgroundColor: cardBg, border: `1px solid ${faint}`, borderRadius: '16px', padding: '32px', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif' }}>No data for this day</div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ backgroundColor: cardBg, border: `1px solid ${faint}`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '40px', fontWeight: 700, color: accent, marginBottom: '8px' }}>
                  {SHORT_MONTHS[currentMonth]}
                </div>
                <div style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
                  Click any day to see your activity details
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div style={{ marginBottom: '20px', flexShrink: 0 }}>
        <p style={{ fontSize: '13px', color: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>Archive</p>
        <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '40px', fontWeight: 700, color: text, letterSpacing: '-1px', lineHeight: 1 }}> <span style={{ color: '#ff4d00' }}>Calendar</span> </h1>
      </div>
      <div style={{ height: '1px', backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', marginBottom: '20px' }} />
      {loading ? (
  <div />
) : (
  view === 'year' ? YearView() : MonthView()
)}
    </AppLayout>
  )
}
