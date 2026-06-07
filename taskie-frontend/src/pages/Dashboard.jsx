import { useState } from 'react'
import AppLayout from '../components/common/AppLayout'
import { useTheme } from '../context/ThemeContext'

const mockTasks = [
  { id: 1, title: 'Complete DSA chapter 3', status: 'completed', priority: 'high' },
  { id: 2, title: 'Morning run — 5km', status: 'completed', priority: 'medium' },
  { id: 3, title: 'Read 20 pages', status: 'pending', priority: 'medium' },
  { id: 4, title: 'Evening walk', status: 'pending', priority: 'low' },
  { id: 5, title: 'Drink 3L water', status: 'pending', priority: 'low' },
]

const mockSchedule = [
  { time: '6:00', label: 'Morning Gym', tag: 'workout', dot: '#c9944a' },
  { time: '7:30', label: 'Breakfast', tag: 'meal', dot: '#5aad7a' },
  { time: '9:00', label: 'Classes / Office', tag: 'work', dot: '#4a90d9' },
  { time: '5:00', label: 'DSA Study Session', tag: 'study', dot: '#8b6bc7' },
  { time: '7:30', label: 'Dinner', tag: 'meal', dot: '#5aad7a' },
  { time: '10:30', label: 'Sleep', tag: 'rest', dot: '#444' },
]

const statusColor = {
  completed: '#5aad7a',
  pending: '#c9944a',
  skipped: '#c76b6b',
}

function generateCalendarData() {
  const days = []
  const today = new Date()
  for (let i = 195; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const rand = Math.random()
    const level = i === 0 ? 3 : rand > 0.6 ? Math.floor(Math.random() * 4) : 0
    days.push({
      date: d.toISOString().split('T')[0],
      level,
    })
  }
  return days
}

const calendarData = generateCalendarData()

function getLevelColor(level, dark) {
  if (level === 0) return dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const colors = ['', '#1a4d2e', '#2d7a4a', '#3da85f', '#4fc46e']
  return colors[level]
}

function StreakCalendar({ dark }) {
  const [tooltip, setTooltip] = useState(null)
  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'

  const weeks = []
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7))
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const days = ['M','T','W','T','F','S','S']

  let streak = 0
  for (let i = calendarData.length - 1; i >= 0; i--) {
    if (calendarData[i].level > 0) streak++
    else break
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '16px', fontWeight: 500, color: text }}>
          Productivity Streak
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '20px' }}>🔥</span>
          <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '20px', fontWeight: 600, color: '#4fc46e' }}>
            {streak} days
          </span>
        </div>
      </div>

      {/* Month labels */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '4px', paddingLeft: '24px' }}>
        {weeks.map((week, wi) => {
          const firstDay = new Date(week[0].date)
          const showMonth = firstDay.getDate() <= 7
          return (
            <div key={wi} style={{ flex: 1, minWidth: 0 }}>
              {showMonth && (
                <span style={{ fontSize: '9px', color: subtle, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                  {months[firstDay.getMonth()]}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: '3px', width: '100%' }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginRight: '4px', flexShrink: 0 }}>
          {days.map((d, i) => (
            <div key={i} style={{
              width: '14px', height: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '8px', color: subtle, fontFamily: 'Inter, sans-serif',
            }}>
              {i % 2 === 0 ? d : ''}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
              {week.map((day, di) => (
                <div
                  key={di}
                  onMouseEnter={() => setTooltip({ day })}
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    width: '100%',
                    height: '12px',
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

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '10px', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', marginRight: '4px' }}>Less</span>
        {[0, 1, 2, 3, 4].map(l => (
          <div key={l} style={{
            width: '10px', height: '10px', borderRadius: '2px',
            backgroundColor: getLevelColor(l, dark),
          }} />
        ))}
        <span style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', marginLeft: '4px' }}>More</span>
      </div>
    </div>
  )
}

function ActivityRings({ completionPct, tasksPct, studyPct }) {
  const size = 140
  const stroke = 12
  const gap = 10

  const rings = [
    { pct: completionPct, color: '#ff375f', track: 'rgba(255,55,95,0.15)', label: 'Completion' },
    { pct: tasksPct, color: '#92d050', track: 'rgba(146,208,80,0.15)', label: 'Tasks' },
    { pct: studyPct, color: '#30d5c8', track: 'rgba(48,213,200,0.15)', label: 'Study' },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {rings.map((ring, i) => {
            const r = (size / 2) - (stroke / 2) - i * (stroke + gap)
            const circumference = 2 * Math.PI * r
            const offset = circumference - (ring.pct / 100) * circumference
            return (
              <g key={i}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={ring.track} strokeWidth={stroke} />
                <circle
                  cx={size/2} cy={size/2} r={r} fill="none"
                  stroke={ring.color} strokeWidth={stroke}
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </g>
            )
          })}
        </svg>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {rings.map((ring, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ring.color }} />
            <div>
              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '16px', fontWeight: 600, color: ring.color, lineHeight: 1 }}>
                {ring.pct}%
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: ring.color, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {ring.label}
              </div>
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
  const faint = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
  const hoverBorder = dark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)'

  const completed = tasks.filter(t => t.status === 'completed').length
  const skipped = tasks.filter(t => t.status === 'skipped').length
  const completionPct = Math.round((completed / tasks.length) * 100)
  const tasksPct = Math.round(((tasks.length - skipped) / tasks.length) * 100)
  const studyPct = 65

  const toggleStatus = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      if (t.status === 'pending') return { ...t, status: 'completed' }
      if (t.status === 'completed') return { ...t, status: 'skipped' }
      return { ...t, status: 'pending' }
    }))
  }

  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id))

  const addTask = (e) => {
    e.preventDefault()
    if (!newTask.trim()) return
    setTasks(prev => [...prev, {
      id: Date.now(),
      title: newTask.trim(),
      status: 'pending',
      priority: 'medium',
    }])
    setNewTask('')
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  const card = (extra = {}) => ({
    backgroundColor: cardBg,
    border: `1px solid ${faint}`,
    borderRadius: '16px',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    ...extra,
  })

  return (
    <AppLayout>
      {/* HEADER */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>{today}</p>
        <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '28px', fontWeight: 600, color: text, letterSpacing: '-0.5px' }}>
          Good day 👋
        </h1>
      </div>

      {/* ROW 1: Activity rings + Streak calendar */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Rings */}
        <div style={card()}>
          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '15px', fontWeight: 500, color: text, marginBottom: '20px' }}>
            Today's Activity
          </div>
          <ActivityRings completionPct={completionPct} tasksPct={tasksPct} studyPct={studyPct} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '20px' }}>
            {[
              { label: 'Tasks Done', value: `${completed}/${tasks.length}` },
              { label: 'Study Hours', value: '2h 30m' },
            ].map(s => (
              <div key={s.label} style={{
                padding: '10px 12px', borderRadius: '10px',
                backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${faint}`,
              }}>
                <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '18px', fontWeight: 600, color: text }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak calendar */}
        <div style={{ ...card(), overflow: 'visible' }}>
          <StreakCalendar dark={dark} />
        </div>
      </div>

      {/* ROW 2: Schedule + Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Schedule */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '16px', fontWeight: 500, color: text }}>
              Today's Schedule
            </span>
            <a href="/planner" style={{ fontSize: '12px', color: subtle, textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>
              Edit →
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {mockSchedule.map((block, i) => (
              <div key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px', borderRadius: '10px',
                  backgroundColor: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${faint}`, transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = hoverBorder}
                onMouseLeave={e => e.currentTarget.style.borderColor = faint}
              >
                <span style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', minWidth: '36px' }}>
                  {block.time}
                </span>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: block.dot, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '13px', color: text, fontFamily: 'Inter, sans-serif' }}>
                  {block.label}
                </span>
                <span style={{
                  fontSize: '10px', padding: '2px 8px', borderRadius: '100px',
                  color: subtle,
                  backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${faint}`, fontFamily: 'Inter, sans-serif',
                }}>
                  {block.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '16px', fontWeight: 500, color: text }}>
              Tasks
            </span>
            <span style={{ fontSize: '12px', color: subtle, fontFamily: 'Inter, sans-serif' }}>
              {completed}/{tasks.length} done
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: '3px', backgroundColor: faint, borderRadius: '2px', marginBottom: '16px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${completionPct}%`,
              backgroundColor: '#5aad7a', borderRadius: '2px',
              transition: 'width 0.4s ease',
            }} />
          </div>

          {/* Task list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            {tasks.map(task => (
              <div key={task.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '10px',
                  backgroundColor: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${faint}`, transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = hoverBorder}
                onMouseLeave={e => e.currentTarget.style.borderColor = faint}
              >
                <button
                  onClick={() => toggleStatus(task.id)}
                  title="Click to cycle status"
                  style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: statusColor[task.status],
                    border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0,
                  }}
                />
                <span style={{
                  flex: 1, fontSize: '13px', fontFamily: 'Inter, sans-serif',
                  color: task.status === 'completed' ? subtle : text,
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  opacity: task.status === 'skipped' ? 0.4 : 1,
                }}>
                  {task.title}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    background: 'none', border: 'none', color: subtle,
                    cursor: 'pointer', fontSize: '14px', opacity: 0.4, padding: '0 2px',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Add task */}
          <form onSubmit={addTask} style={{ display: 'flex', gap: '8px' }}>
            <input
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
              placeholder="Add a task..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '10px',
                fontSize: '13px', fontFamily: 'Inter, sans-serif',
                backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${faint}`, color: text, outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = hoverBorder}
              onBlur={e => e.target.style.borderColor = faint}
            />
            <button type="submit" style={{
              padding: '10px 16px', borderRadius: '10px', fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
              border: `1px solid ${faint}`, color: text, cursor: 'pointer',
            }}>
              Add
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  )
}