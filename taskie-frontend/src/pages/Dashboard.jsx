import { useState } from 'react'
import AppLayout from '../components/common/AppLayout'
import { useTheme } from '../context/ThemeContext'

const mockTasks = [
  { id: 1, title: 'Complete DSA chapter 3', status: 'completed', tag: 'study' },
  { id: 2, title: 'Morning run — 5km', status: 'completed', tag: 'fitness' },
  { id: 3, title: 'Read 20 pages', status: 'pending', tag: 'reading' },
  { id: 4, title: 'Evening walk', status: 'pending', tag: 'fitness' },
  { id: 5, title: 'Drink 3L water', status: 'pending', tag: 'health' },
]

const mockSchedule = [
  { time: '6:00', label: 'Morning Gym', tag: 'workout', dot: '#ff4d00' },
  { time: '7:30', label: 'Breakfast', tag: 'meal', dot: '#5aad7a' },
  { time: '9:00', label: 'Classes / Office', tag: 'work', dot: '#4a90d9' },
  { time: '5:00', label: 'DSA Study Session', tag: 'study', dot: '#8b6bc7' },
  { time: '7:30', label: 'Dinner', tag: 'meal', dot: '#5aad7a' },
  { time: '10:30', label: 'Sleep', tag: 'rest', dot: '#555' },
]

const tagStyle = {
  study:   { bg: 'rgba(139,107,199,0.15)', color: '#a78bda', border: 'rgba(139,107,199,0.3)' },
  fitness: { bg: 'rgba(255,77,0,0.1)',     color: '#ff6b2b', border: 'rgba(255,77,0,0.25)' },
  reading: { bg: 'rgba(74,144,217,0.12)',  color: '#6aabf7', border: 'rgba(74,144,217,0.3)' },
  health:  { bg: 'rgba(90,173,122,0.12)',  color: '#5aad7a', border: 'rgba(90,173,122,0.3)' },
  work:    { bg: 'rgba(74,144,217,0.12)',  color: '#6aabf7', border: 'rgba(74,144,217,0.3)' },
  meal:    { bg: 'rgba(90,173,122,0.12)',  color: '#5aad7a', border: 'rgba(90,173,122,0.3)' },
  workout: { bg: 'rgba(255,77,0,0.1)',     color: '#ff6b2b', border: 'rgba(255,77,0,0.25)' },
  rest:    { bg: 'rgba(100,100,100,0.1)',  color: '#888',    border: 'rgba(100,100,100,0.2)' },
  sleep:   { bg: 'rgba(139,107,199,0.15)', color: '#a78bda', border: 'rgba(139,107,199,0.3)' },
  wake:    { bg: 'rgba(201,148,74,0.15)',  color: '#c9944a', border: 'rgba(201,148,74,0.3)' },
  personal:{ bg: 'rgba(201,148,74,0.15)', color: '#c9944a', border: 'rgba(201,148,74,0.3)' },
  break:   { bg: 'rgba(100,100,100,0.1)',  color: '#888',    border: 'rgba(100,100,100,0.2)' },
  general: { bg: 'rgba(100,100,100,0.1)',  color: '#888',    border: 'rgba(100,100,100,0.2)' },
}

const TAG_DOTS = {
  workout: '#ff4d00', meal: '#5aad7a', work: '#4a90d9',
  study: '#8b6bc7', water: '#4a9fd9', rest: '#555',
  sleep: '#8b6bc7', wake: '#c9944a', personal: '#c9944a',
  break: '#555', default: '#888',
}

function getSavedSchedule() {
  try {
    const raw = localStorage.getItem('synq-schedule')
    if (!raw) return null
    const { date, blocks } = JSON.parse(raw)
    const today = new Date().toISOString().split('T')[0]
    if (date !== today) return null
    return blocks
  } catch { return null }
}

function generateCalendarData() {
  const days = []
  const today = new Date()
  for (let i = 195; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const rand = Math.random()
    const level = i === 0 ? 3 : rand > 0.6 ? Math.floor(Math.random() * 4) : 0
    days.push({ date: d.toISOString().split('T')[0], level })
  }
  return days
}
const calendarData = generateCalendarData()

function getLevelColor(level, dark) {
  if (level === 0) return dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
  const colors = ['', 'rgba(255,77,0,0.2)', 'rgba(255,77,0,0.4)', 'rgba(255,77,0,0.65)', '#ff4d00']
  return colors[level]
}

function StreakCalendar({ dark }) {
  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'

  const weeks = []
  for (let i = 0; i < calendarData.length; i += 7)
    weeks.push(calendarData.slice(i, i + 7))

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const days = ['M','T','W','T','F','S','S']

  let streak = 0
  for (let i = calendarData.length - 1; i >= 0; i--) {
    if (calendarData[i].level > 0) streak++
    else break
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif', color: subtle, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Streak</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '28px', fontWeight: 700, color: '#ff4d00', letterSpacing: '-1px', lineHeight: 1 }}>{streak}</span>
            <span style={{ fontSize: '12px', color: subtle, fontFamily: 'Inter, sans-serif' }}>days</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Best</div>
          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '18px', fontWeight: 600, color: text }}>12 days</div>
        </div>
      </div>

      <div style={{ display: 'flex', marginBottom: '3px', paddingLeft: '18px' }}>
        {weeks.map((week, wi) => {
          const firstDay = new Date(week[0].date)
          const showMonth = firstDay.getDate() <= 7
          return (
            <div key={wi} style={{ flex: 1, minWidth: 0 }}>
              {showMonth && (
                <span style={{ fontSize: '8px', color: subtle, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                  {months[firstDay.getMonth()]}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '2px', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '3px', flexShrink: 0, justifyContent: 'space-around' }}>
          {days.map((d, i) => (
            <div key={i} style={{
              width: '10px', height: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '7px', color: subtle, fontFamily: 'Inter, sans-serif',
            }}>
              {d}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
              {week.map((day, di) => (
                <div key={di} style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '2px',
                  backgroundColor: getLevelColor(day.level, dark),
                  cursor: 'pointer',
                  transition: 'opacity 0.1s',
                }}
                  onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '8px', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '9px', color: subtle, fontFamily: 'Inter, sans-serif', marginRight: '3px' }}>Less</span>
        {[0,1,2,3,4].map(l => (
          <div key={l} style={{ width: '8px', height: '8px', borderRadius: '1px', backgroundColor: getLevelColor(l, dark) }} />
        ))}
        <span style={{ fontSize: '9px', color: subtle, fontFamily: 'Inter, sans-serif', marginLeft: '3px' }}>More</span>
      </div>
    </div>
  )
}

function ActivityRings({ completionPct, tasksPct, studyPct }) {
  const size = 130, stroke = 11, gap = 9
  const rings = [
    { pct: completionPct, color: '#ff4d00', track: 'rgba(255,77,0,0.12)', label: 'Completion' },
    { pct: tasksPct,      color: '#5aad7a', track: 'rgba(90,173,122,0.12)', label: 'Tasks' },
    { pct: studyPct,      color: '#4a90d9', track: 'rgba(74,144,217,0.12)', label: 'Study' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
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
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {rings.map((ring, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: ring.color }} />
            <div>
              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '18px', fontWeight: 700, color: ring.color, lineHeight: 1 }}>{ring.pct}%</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: ring.color, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{ring.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const [tasks, setTasks] = useState(mockTasks)
  const [newTask, setNewTask] = useState('')

  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  const faint = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const cardBg = dark ? '#161616' : '#ffffff'
  const hoverBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'

  const completed = tasks.filter(t => t.status === 'completed').length
  const completionPct = Math.round((completed / tasks.length) * 100)
  const tasksPct = Math.round((tasks.filter(t => t.status !== 'skipped').length / tasks.length) * 100)
  const studyPct = 65

  const toggleStatus = (id) =>
    setTasks(prev => prev.map(t => t.id !== id ? t : { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }))

  const addTask = (e) => {
    e.preventDefault()
    if (!newTask.trim()) return
    setTasks(prev => [...prev, { id: Date.now(), title: newTask.trim(), status: 'pending', tag: 'general' }])
    setNewTask('')
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const card = (extra = {}) => ({
    backgroundColor: cardBg,
    border: `1px solid ${faint}`,
    borderRadius: '18px',
    padding: '24px',
    ...extra,
  })

  const displaySchedule = getSavedSchedule() || mockSchedule

  return (
    <AppLayout>
      <div style={{ marginBottom: '36px' }}>
        <p style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>{today}</p>
        <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '40px', fontWeight: 700, color: text, letterSpacing: '-1.5px', lineHeight: 1 }}>
          <span style={{ color: '#ff4d00' }}>SYNQ</span> your day !
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={card()}>
          <div style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color: subtle, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
            Today's Activity
          </div>
          <ActivityRings completionPct={completionPct} tasksPct={tasksPct} studyPct={studyPct} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '20px' }}>
            {[{ label: 'Tasks Done', value: `${completed}/${tasks.length}` }, { label: 'Study Hours', value: '2h 30m' }].map(s => (
              <div key={s.label} style={{ padding: '12px', borderRadius: '12px', backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${faint}` }}>
                <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '20px', fontWeight: 700, color: text }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card(), overflow: 'visible', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <StreakCalendar dark={dark} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '18px', fontWeight: 600, color: text, letterSpacing: '-0.3px' }}>
              Today's Schedule
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {getSavedSchedule() && (
                <button
                  onClick={() => { localStorage.removeItem('synq-schedule'); window.location.reload() }}
                  style={{ fontSize: '12px', color: subtle, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Clear
                </button>
              )}
              <a href="/planner" style={{ fontSize: '12px', color: '#ff4d00', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>
                Edit →
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {displaySchedule.map((block, i) => {
              const ts = tagStyle[block.tag] || tagStyle.rest
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px', borderRadius: '12px',
                  backgroundColor: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${faint}`, transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = hoverBorder}
                  onMouseLeave={e => e.currentTarget.style.borderColor = faint}
                >
                  <span style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', minWidth: '36px' }}>{block.time}</span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: block.dot || TAG_DOTS[block.tag] || '#888', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: '13px', color: text, fontFamily: 'Inter, sans-serif' }}>{block.label}</span>
                  <span style={{
                    fontSize: '10px', padding: '3px 10px', borderRadius: '100px',
                    color: ts.color, backgroundColor: ts.bg,
                    border: `1px solid ${ts.border}`,
                    fontFamily: 'Inter, sans-serif',
                  }}>{block.tag}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '18px', fontWeight: 600, color: text, letterSpacing: '-0.3px' }}>
              Tasks
            </div>
            <span style={{ fontSize: '12px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{completed}/{tasks.length} done</span>
          </div>

          <div style={{ height: '3px', backgroundColor: faint, borderRadius: '2px', marginBottom: '16px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${completionPct}%`, backgroundColor: '#ff4d00', borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            {tasks.map(task => {
              const ts = tagStyle[task.tag] || tagStyle.rest
              return (
                <div key={task.id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '12px',
                  backgroundColor: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${faint}`, transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = hoverBorder}
                  onMouseLeave={e => e.currentTarget.style.borderColor = faint}
                >
                  <button onClick={() => toggleStatus(task.id)} style={{
                    width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
                    border: `1.5px solid ${task.status === 'completed' ? '#ff4d00' : dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                    backgroundColor: task.status === 'completed' ? '#ff4d00' : 'transparent',
                    cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {task.status === 'completed' && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  <span style={{
                    flex: 1, fontSize: '13px', fontFamily: 'Inter, sans-serif',
                    color: task.status === 'completed' ? subtle : text,
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    transition: 'all 0.2s',
                  }}>{task.title}</span>
                  <span style={{
                    fontSize: '10px', padding: '3px 10px', borderRadius: '100px',
                    color: ts.color, backgroundColor: ts.bg,
                    border: `1px solid ${ts.border}`,
                    fontFamily: 'Inter, sans-serif',
                  }}>{task.tag}</span>
                </div>
              )
            })}
          </div>

          <form onSubmit={addTask} style={{ display: 'flex', gap: '8px' }}>
            <input value={newTask} onChange={e => setNewTask(e.target.value)}
              placeholder="Add a task..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '10px',
                fontSize: '13px', fontFamily: 'Inter, sans-serif',
                backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${faint}`, color: text, outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#ff4d00'}
              onBlur={e => e.target.style.borderColor = faint}
            />
            <button type="submit" style={{
              padding: '10px 18px', borderRadius: '10px', fontSize: '13px',
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
              backgroundColor: '#ff4d00', color: 'white',
              border: 'none', cursor: 'pointer',
            }}>
              Add
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}