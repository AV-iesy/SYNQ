import { useState, useEffect } from 'react'
import AppLayout from '../components/common/AppLayout'
import { useTheme } from '../context/ThemeContext'
import InfinityIcon from '../components/common/InfinityIcon'
import LoadingSplash from '../components/common/LoadingSplash'
import * as taskApi from '../api/tasks'
import * as scheduleApi from '../api/schedule'

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

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function buildCalendarData(scheduleDates) {
  const days = []
  const today = new Date()
  for (let i = 195; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const level = scheduleDates.has(key) ? 4 : 0
    days.push({ date: key, level })
  }
  return days
}

function getLevelColor(level, dark) {
  if (level === 0) return dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
  const colors = ['', 'rgba(255,77,0,0.2)', 'rgba(255,77,0,0.4)', 'rgba(255,77,0,0.65)', '#ff4d00']
  return colors[level]
}

function StreakCalendar({ dark, calendarData }) {
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

let bestStreak = 0
let current = 0
for (let i = 0; i < calendarData.length; i++) {
  if (calendarData[i].level > 0) {
    current++
    bestStreak = Math.max(bestStreak, current)
  } else {
    current = 0
  }
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
  <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '18px', fontWeight: 600, color: text }}>{bestStreak} days</div>
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
                  cursor: day.level > 0 ? 'pointer' : 'default',
                  transition: 'opacity 0.1s',
                }}
                  onMouseOver={e => { if (day.level > 0) e.currentTarget.style.opacity = '0.7' }}
                  onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  onClick={() => {
                    if (day.level > 0) {
                      const [year, month] = day.date.split('-').map(Number)
                      localStorage.setItem('synq-calendar-nav', JSON.stringify({
                        year,
                        month: month - 1,
                        date: day.date,
                      }))
                      setTimeout(() => { window.location.href = '/calendar' }, 50)
                    }
                  }}
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
    { pct: studyPct,      color: '#4a90d9', track: 'rgba(74,144,217,0.12)', label: 'Focus' },
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

  const todayKey = getTodayKey()

  const [tasks, setTasks] = useState([])
const [schedule, setSchedule] = useState(null)
const [calendarData, setCalendarData] = useState([])
const [newTask, setNewTask] = useState('')
const [loading, setLoading] = useState(true)
const [confirmTask, setConfirmTask] = useState(null)
const [partialTask, setPartialTask] = useState(null)
const [adjustText, setAdjustText] = useState('')

  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  const faint = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const cardBg = dark ? '#161616' : '#ffffff'
  const hoverBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
  setLoading(true)
  try {
    const [tasksData, scheduleData, allSchedules] = await Promise.all([
      taskApi.getTasks(todayKey),
      scheduleApi.getSchedule(todayKey),
      scheduleApi.getAllSchedules(),
    ])
    setTasks(tasksData || [])
    setSchedule(scheduleData?.blocks || null)

    const scheduleDates = new Set((allSchedules || []).map(s => s.date))
    setCalendarData(buildCalendarData(scheduleDates))
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
  } finally {
    setLoading(false)
  }
}

  const completed = tasks.filter(t => t.status === 'completed').length
const completionPct = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100)
const tasksPct = tasks.length === 0 ? 0 : Math.round((tasks.length / tasks.length) * 100)

const focusMinutes = (schedule || [])
  .filter(b => b.tag === 'study' || b.tag === 'work')
  .reduce((total, b) => {
    const [sh, sm] = b.time.split(':').map(Number)
    const [eh, em] = b.endTime.split(':').map(Number)
    return total + ((eh * 60 + em) - (sh * 60 + sm))
  }, 0)

const focusHoursText = focusMinutes === 0
  ? '—'
  : focusMinutes >= 60
    ? `${Math.floor(focusMinutes / 60)}h ${focusMinutes % 60 > 0 ? `${focusMinutes % 60}m` : ''}`.trim()
    : `${focusMinutes}m`

const focusPct = focusMinutes === 0 ? 0 : Math.min(100, Math.round((focusMinutes / 240) * 100)) // assumes 4hr daily goal

  const toggleStatus = (task) => {
  // Unchecking a completed/partial task → just go back to pending, no popup needed
  if (task.status === 'completed' || task.status === 'partial') {
    updateTaskStatus(task, 'pending')
    return
  }
  // Checking off a pending task → ask for confirmation first
  setConfirmTask(task)
}

const updateTaskStatus = async (task, newStatus, newTitle = null) => {
  setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: newStatus, ...(newTitle ? { title: newTitle } : {}) } : t))
  try {
    const updates = { status: newStatus }
    if (newTitle) updates.title = newTitle
    await taskApi.updateTask(task._id, updates)
  } catch (err) {
    console.error('Failed to update task:', err)
    setTasks(prev => prev.map(t => t._id === task._id ? { ...t, status: task.status, title: task.title } : t))
  }
}

const handleFullyDone = () => {
  updateTaskStatus(confirmTask, 'completed')
  setConfirmTask(null)
}

const handlePartial = () => {
  setPartialTask(confirmTask)
  setConfirmTask(null)
}

const handleRemindTomorrow = async () => {
  const todayDate = new Date(todayKey)
  const tomorrow = new Date(todayDate)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowKey = tomorrow.toISOString().split('T')[0]

  try {
    await taskApi.createTask(partialTask.title, tomorrowKey, partialTask.tag)
    updateTaskStatus(partialTask, 'partial')
  } catch (err) {
    console.error('Failed to create reminder task:', err)
  }
  setPartialTask(null)
}

const handleAdjustNow = (newTitle) => {
  updateTaskStatus(partialTask, 'completed', newTitle)
  setPartialTask(null)
}

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return
    const title = newTask.trim()
    setNewTask('')
    try {
      const created = await taskApi.createTask(title, todayKey)
      setTasks(prev => [...prev, created])
    } catch (err) {
      console.error('Failed to add task:', err)
    }
  }

  const clearAllTasks = async () => {
    try {
      await taskApi.clearAllTasks(todayKey)
      setTasks([])
    } catch (err) {
      console.error('Failed to clear tasks:', err)
    }
  }

  const clearSchedule = async () => {
    try {
      await scheduleApi.deleteSchedule(todayKey)
      setSchedule(null)
    } catch (err) {
      console.error('Failed to clear schedule:', err)
    }
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const card = (extra = {}) => ({
    backgroundColor: cardBg,
    border: `1px solid ${faint}`,
    borderRadius: '18px',
    padding: '24px',
    ...extra,
  })

 if (loading) {
  return (
    <AppLayout>
      <LoadingSplash label="Loading your dashboard..." />
    </AppLayout>
  )
}

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '36px' }}>
        <div>
          <p style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>{today}</p>
          <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '40px', fontWeight: 700, color: text, letterSpacing: '-1.5px', lineHeight: 1 }}>
            <span style={{ color: '#ff4d00' }}>Dashboard</span>
          </h1>
        </div>
        <InfinityIcon size={64} color="#FF0000" strokeWidth={2.5} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', marginBottom: '16px' }}>
        <div style={card()}>
          <div style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color: subtle, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
            Today's Activity
          </div>
          <ActivityRings completionPct={completionPct} tasksPct={tasksPct} studyPct={focusPct} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '20px' }}>
           {[{ label: 'Tasks Done', value: `${completed}/${tasks.length}` }, { label: 'Focus Hours', value: focusHoursText }].map(s => (
              <div key={s.label} style={{ padding: '12px', borderRadius: '12px', backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${faint}` }}>
                <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '20px', fontWeight: 700, color: text }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card(), overflow: 'visible', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
  <StreakCalendar dark={dark} calendarData={calendarData} />
</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'stretch' }}>

        <div style={{ ...card(), display: 'flex', flexDirection: 'column' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
    <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '18px', fontWeight: 600, color: text, letterSpacing: '-0.3px' }}>
      Today's Schedule
    </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {schedule && (
                <button
                  onClick={clearSchedule}
                  style={{ fontSize: '12px', color: '#ff4d00', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Clear
                </button>
              )}
              <a href="/planner" style={{ fontSize: '12px', color: '#ff4d00', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}>
                Edit →
              </a>
            </div>
          </div>
          {schedule && schedule.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
              {schedule.map((block, i) => {
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
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: TAG_DOTS[block.tag] || '#888', flexShrink: 0 }} />
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
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: subtle, fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
              No schedule yet — <a href="/planner" style={{ color: '#ff4d00', textDecoration: 'none' }}>create one in Planner</a>
            </div>
          )}
        </div>

        <div style={{ ...card(), display: 'flex', flexDirection: 'column' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
    <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '18px', fontWeight: 600, color: text, letterSpacing: '-0.3px' }}>
      Tasks
    </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {tasks.length > 0 && (
                <button
                  onClick={clearAllTasks}
                  style={{ fontSize: '12px', color: subtle, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                >
                  Clear all
                </button>
              )}
              <span style={{ fontSize: '12px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{completed}/{tasks.length} done</span>
            </div>
          </div>

          <div style={{ height: '3px', backgroundColor: faint, borderRadius: '2px', marginBottom: '16px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${completionPct}%`, backgroundColor: '#ff4d00', borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>

          <div className="schedule-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
  {tasks.map(task => {
              const ts = tagStyle[task.tag] || tagStyle.rest
              return (
                <div key={task._id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '12px',
                  backgroundColor: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${faint}`, transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = hoverBorder}
                  onMouseLeave={e => e.currentTarget.style.borderColor = faint}
                >
                  <button onClick={() => toggleStatus(task)} style={{
  width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0,
  border: `1.5px solid ${task.status === 'completed' ? '#ff4d00' : task.status === 'partial' ? '#c9944a' : dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
  backgroundColor: task.status === 'completed' ? '#ff4d00' : task.status === 'partial' ? '#c9944a' : 'transparent',
  cursor: 'pointer', padding: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.15s',
}}>
  {task.status === 'completed' && (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )}
  {task.status === 'partial' && (
    <div style={{ width: '7px', height: '2px', backgroundColor: 'white', borderRadius: '1px' }} />
  )}
</button>
<span style={{
  flex: 1, fontSize: '13px', fontFamily: 'Inter, sans-serif',
  color: task.status === 'completed' ? subtle : text,
  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
  transition: 'all 0.2s',
}}>{task.title}</span>
{task.status === 'partial' && (
  <span style={{
    fontSize: '9px', padding: '3px 9px', borderRadius: '100px',
    color: '#c9944a', backgroundColor: 'rgba(201,148,74,0.15)',
    border: '1px solid rgba(201,148,74,0.3)',
    fontFamily: 'Inter, sans-serif', fontWeight: 600,
  }}>Partial</span>
)}
<span style={{
  fontSize: '10px', padding: '3px 10px', borderRadius: '100px',
  color: ts.color, backgroundColor: ts.bg,
  border: `1px solid ${ts.border}`,
  fontFamily: 'Inter, sans-serif',
}}>{task.tag}</span>
                </div>
              )
            })}
            {tasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: subtle, fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
                No tasks yet — add one below
              </div>
            )}
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

      {/* Confirmation modal — did you fully complete this? */}
      {confirmTask && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setConfirmTask(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: cardBg, border: `1px solid ${faint}`,
              borderRadius: '18px', padding: '28px', width: '380px',
            }}
          >
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '17px', fontWeight: 600, color: text, marginBottom: '8px' }}>
              Did you fully complete this?
            </div>
            <div style={{
              fontSize: '14px', color: '#ff4d00', fontFamily: 'Inter, sans-serif',
              padding: '10px 14px', borderRadius: '10px', marginBottom: '20px',
              backgroundColor: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.2)',
            }}>
              {confirmTask.title}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setConfirmTask(null)}
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px', fontSize: '13px',
                  fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                  backgroundColor: 'transparent', border: `1px solid ${faint}`, color: subtle,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePartial}
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px', fontSize: '13px',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500, cursor: 'pointer',
                  backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${faint}`, color: text,
                }}
              >
                No, partially
              </button>
              <button
                onClick={handleFullyDone}
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px', fontSize: '13px',
                  fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, cursor: 'pointer',
                  backgroundColor: '#5aad7a', color: 'white', border: 'none',
                }}
              >
                Yes, done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partial completion follow-up */}
      {partialTask && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => { setPartialTask(null); setAdjustText('') }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: cardBg, border: `1px solid ${faint}`,
              borderRadius: '18px', padding: '28px', width: '420px',
            }}
          >
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '17px', fontWeight: 600, color: text, marginBottom: '8px' }}>
              No problem — what now?
            </div>
            <div style={{
              fontSize: '14px', color: '#ff4d00', fontFamily: 'Inter, sans-serif',
              padding: '10px 14px', borderRadius: '10px', marginBottom: '20px',
              backgroundColor: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.2)',
            }}>
              {partialTask.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <button
                onClick={handleRemindTomorrow}
                style={{
                  textAlign: 'left', padding: '14px 16px', borderRadius: '12px',
                  backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${faint}`, cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: 500, color: text, marginBottom: '2px' }}>
                  Remind me tomorrow
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color: subtle }}>
                  Marks today as partial and adds this to tomorrow's tasks
                </div>
              </button>
            </div>

            <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Or adjust to reflect what you actually did
            </div>
            <input
              value={adjustText}
              onChange={e => setAdjustText(e.target.value)}
              placeholder={`e.g. "${partialTask.title.replace(/\d+/, '2')}"`}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                fontSize: '13px', fontFamily: 'Inter, sans-serif',
                backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${faint}`, color: text, outline: 'none', marginBottom: '12px',
              }}
              onFocus={e => e.target.style.borderColor = '#ff4d00'}
              onBlur={e => e.target.style.borderColor = faint}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setPartialTask(null); setAdjustText('') }}
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px', fontSize: '13px',
                  fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                  backgroundColor: 'transparent', border: `1px solid ${faint}`, color: subtle,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { if (adjustText.trim()) { handleAdjustNow(adjustText.trim()); setAdjustText('') } }}
                disabled={!adjustText.trim()}
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px', fontSize: '13px',
                  fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700,
                  cursor: adjustText.trim() ? 'pointer' : 'not-allowed',
                  backgroundColor: adjustText.trim() ? '#ff4d00' : faint,
                  color: adjustText.trim() ? 'white' : subtle, border: 'none',
                }}
              >
                Save & mark done
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}