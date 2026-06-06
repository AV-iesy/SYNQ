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

// ── Activity Ring Component ─────────────────────────────────────
function Ring({ percentage, color, trackColor, size = 80, stroke = 8, label, value }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={stroke}
          />
          {/* Progress */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        {/* Center value */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontSize: size > 100 ? '22px' : '14px',
          fontWeight: 600,
          color: color,
        }}>
          {value}
        </div>
      </div>
      <span style={{
        fontSize: '11px',
        fontFamily: 'Inter, sans-serif',
        color: color,
        opacity: 0.7,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {label}
      </span>
    </div>
  )
}

// ── Stacked Rings (like Apple Activity) ────────────────────────
function ActivityRings({ completionPct, tasksPct, studyPct }) {
  const size = 160
  const stroke = 14
  const gap = 10

  const rings = [
    { pct: completionPct, color: '#ff375f', track: 'rgba(255,55,95,0.15)', label: 'Completion' },
    { pct: tasksPct, color: '#92d050', track: 'rgba(146,208,80,0.15)', label: 'Tasks' },
    { pct: studyPct, color: '#30d5c8', track: 'rgba(48,213,200,0.15)', label: 'Study' },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
      {/* Stacked rings */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {rings.map((ring, i) => {
            const r = (size / 2) - (stroke / 2) - i * (stroke + gap)
            const circumference = 2 * Math.PI * r
            const offset = circumference - (ring.pct / 100) * circumference
            return (
              <g key={i}>
                <circle
                  cx={size / 2} cy={size / 2} r={r}
                  fill="none" stroke={ring.track} strokeWidth={stroke}
                />
                <circle
                  cx={size / 2} cy={size / 2} r={r}
                  fill="none" stroke={ring.color} strokeWidth={stroke}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {rings.map((ring, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              backgroundColor: ring.color, flexShrink: 0,
            }} />
            <div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: '18px', fontWeight: 600,
                color: ring.color, lineHeight: 1,
              }}>
                {ring.pct}%
              </div>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                color: ring.color,
                opacity: 0.6,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
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
  const studyPct = 65 // mock — will come from real data later

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
      {/* ── HEADER ── */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>
          {today}
        </p>
        <h1 style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontSize: '28px', fontWeight: 600,
          color: text, letterSpacing: '-0.5px',
        }}>
          Good day 👋
        </h1>
      </div>

      {/* ── TOP ROW: RINGS + STREAK ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Activity Rings card */}
        <div style={card()}>
          <div style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: '16px', fontWeight: 500,
            color: text, marginBottom: '24px',
          }}>
            Today's Activity
          </div>
          <ActivityRings
            completionPct={completionPct}
            tasksPct={tasksPct}
            studyPct={studyPct}
          />
        </div>

        {/* Streak + quick stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Streak */}
          <div style={{
            ...card(),
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flex: 1,
          }}>
            <div>
              <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Current Streak
              </div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: '36px', fontWeight: 600,
                color: text, letterSpacing: '-1px', lineHeight: 1,
              }}>
                5
              </div>
              <div style={{ fontSize: '12px', color: subtle, fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>
                consecutive days
              </div>
            </div>
            <div style={{ fontSize: '48px', opacity: 0.8 }}>🔥</div>
          </div>

          {/* Mini stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={card({ padding: '16px' })}>
              <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tasks Done
              </div>
              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '22px', fontWeight: 600, color: text }}>
                {completed}/{tasks.length}
              </div>
            </div>
            <div style={card({ padding: '16px' })}>
              <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Study Hours
              </div>
              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '22px', fontWeight: 600, color: text }}>
                2h 30m
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: SCHEDULE + TASKS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Schedule */}
        <div style={card()}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '20px',
          }}>
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
                  color: subtle, backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
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
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '16px',
          }}>
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
                  title="Click to change status"
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