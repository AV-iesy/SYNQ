import { useState } from 'react'
import AppLayout from '../components/common/AppLayout'
import { useTheme } from '../context/ThemeContext'

function generateHistory() {
  const data = {}
  const today = new Date()
  for (let i = 365; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const rand = Math.random()
    if (rand > 0.35) {
      const level = rand > 0.85 ? 4 : rand > 0.65 ? 3 : rand > 0.5 ? 2 : 1
      const taskSets = [
        ['DSA Practice', 'Morning Run', 'Read 20 pages', 'Drink water'],
        ['Physics revision', 'Evening walk', 'Drink 3L water', 'Journal'],
        ['React project', 'Gym session', 'Journal entry', 'Study group'],
        ['Math problems', 'Study group', 'Meal prep', 'Evening run'],
        ['Code review', 'Meditation', 'Evening run', 'DSA problems'],
      ]
      const tasks = taskSets[Math.floor(Math.random() * taskSets.length)]
      data[key] = {
        level,
        completed: tasks.slice(0, level + 1),
        total: 5,
        studyHours: Math.floor(Math.random() * 4) + 1,
        completionPct: Math.round((level / 4) * 100),
      }
    }
  }
  return data
}

const historyData = generateHistory()

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const SHORT_MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

const monthColors = [
  '#4a6fd4','#8b2252','#6b7c2e','#c0392b',
  '#c9944a','#ff4d00','#666666','#8b4fb5',
  '#1a3a8f','#7a3010','#4a90d9','#8b1a1a',
]

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

export default function Calendar() {
  const { theme } = useTheme()
  const dark = theme === 'dark'

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
  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
  const faint = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const cardBg = dark ? '#161616' : '#ffffff'
  const cellBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'

  const accent = monthColors[currentMonth]

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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={() => setCurrentYear(y => y-1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${faint}`, backgroundColor: 'transparent', color: subtle, cursor: 'pointer', fontSize: '14px' }}>←</button>
          <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '32px', fontWeight: 700, color: text, letterSpacing: '-1px' }}>{currentYear}</h1>
          <button onClick={() => setCurrentYear(y => y+1)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${faint}`, backgroundColor: 'transparent', color: subtle, cursor: 'pointer', fontSize: '14px' }}>→</button>
        </div>
        
      </div>

      {/* 12 month grid */}
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
              {/* Month header */}
              <div style={{ backgroundColor: col, padding: '8px 12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '18px', fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>
                  {SHORT_MONTHS[mi]}
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{currentYear}</span>
              </div>

              {/* Day labels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '4px 6px 0', gap: '1px', flexShrink: 0 }}>
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: '7px', color: subtle, fontFamily: 'Inter, sans-serif', padding: '2px 0' }}>{d}</div>
                ))}
              </div>

              {/* Day grid */}
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
        {/* Header */}
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

        {/* Body */}
        <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
          {/* Calendar grid */}
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

          {/* Right panel */}
          <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                          tasksPct={Math.round((selectedData.completed.length / selectedData.total) * 100)}
                          studyPct={selectedData.studyHours * 20}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {[
                            { label: 'Completion', pct: selectedData.completionPct, color: '#ff4d00' },
                            { label: 'Tasks', pct: Math.round((selectedData.completed.length / selectedData.total) * 100), color: '#5aad7a' },
                            { label: 'Study', pct: selectedData.studyHours * 20, color: '#4a90d9' },
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[{ label: 'Tasks done', value: `${selectedData.completed.length}/${selectedData.total}` }, { label: 'Study hours', value: `${selectedData.studyHours}h` }].map(s => (
                        <div key={s.label} style={{ padding: '14px', borderRadius: '12px', backgroundColor: cardBg, border: `1px solid ${faint}` }}>
                          <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{s.label}</div>
                          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '22px', fontWeight: 700, color: text }}>{s.value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ backgroundColor: cardBg, border: `1px solid ${faint}`, borderRadius: '16px', padding: '20px', flex: 1, overflow: 'auto' }}>
                      <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Completed tasks</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedData.completed.map((task, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${faint}` }}>
                            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: accent, flexShrink: 0 }} />
                            <span style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', color: text }}>{task}</span>
                          </div>
                        ))}
                      </div>
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
        <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '32px', fontWeight: 700, color: text, letterSpacing: '-1px', lineHeight: 1 }}>Calendar</h1>
      </div>
      <div style={{ height: '1px', backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', marginBottom: '20px' }} />
      {view === 'year' ? <YearView /> : <MonthView />}
    </AppLayout>
  )
}