import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import AppLayout from '../components/common/AppLayout'
import { useTheme } from '../context/ThemeContext'
import * as taskApi from '../api/tasks'
import * as scheduleApi from '../api/schedule'
import * as journalApi from '../api/journal'
import { usePageTransition } from '../context/PageTransitionContext'

const RANGES = [
  { key: 7, label: '7d' },
  { key: 30, label: '30d' },
  { key: 90, label: '90d' },
]

const TAG_COLORS = {
  work: '#4a90d9', study: '#8b6bc7', gym: '#ff4d00', workout: '#ff4d00',
  meal: '#5aad7a', personal: '#c9944a', health: '#5aad7a',
  break: '#666', wake: '#c9944a', sleep: '#8b6bc7', general: '#888',
}

const MOOD_SCORES = { great: 5, good: 4, okay: 3, low: 2, rough: 1 }
const MOOD_COLORS = { great: '#ff4d00', good: '#5aad7a', okay: '#4a90d9', low: '#8b6bc7', rough: '#888' }

function getDateRange(days) {
  const dates = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

export default function Analytics() {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const { reportReady } = usePageTransition()

  const [range, setRange] = useState(7)
  const [loading, setLoading] = useState(true)
  const [tasksByDate, setTasksByDate] = useState({})
  const [schedules, setSchedules] = useState([])
  const [journalEntries, setJournalEntries] = useState({})

  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  const faint = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const cardBg = dark ? '#161616' : '#ffffff'
  const gridColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  const card = (extra = {}) => ({
    backgroundColor: cardBg,
    border: `1px solid ${faint}`,
    borderRadius: '16px',
    padding: '18px',
    ...extra,
  })

  useEffect(() => {
    loadData()
  }, [range])

  const loadData = async () => {
    setLoading(true)
    try {
      const dates = getDateRange(range)

      const [allSchedules, allJournal, taskLists] = await Promise.all([
        scheduleApi.getAllSchedules(),
        journalApi.getAllEntries(),
        Promise.all(dates.map(d => taskApi.getTasks(d).catch(() => []))),
      ])

      const tByDate = {}
      dates.forEach((d, i) => { tByDate[d] = taskLists[i] || [] })
      setTasksByDate(tByDate)

      const dateSet = new Set(dates)
      setSchedules((allSchedules || []).filter(s => dateSet.has(s.date)))

      const jByDate = {}
      ;(allJournal || []).forEach(e => { if (dateSet.has(e.date)) jByDate[e.date] = e })
      setJournalEntries(jByDate)
    } catch (err) {
  console.error('Failed to load Analytics data:', err)
} finally {
  setLoading(false)
  reportReady()
}
  }

  if (loading) {
  return <AppLayout><div /></AppLayout>
}

  const dates = getDateRange(range)

  let totalTasks = 0, totalCompleted = 0, totalFocusMinutes = 0

  const scheduleByDate = {}
  schedules.forEach(s => { scheduleByDate[s.date] = s })

  const trendData = dates.map(date => {
    const dayTasks = tasksByDate[date] || []
    const completed = dayTasks.filter(t => t.status === 'completed').length
    const pct = dayTasks.length === 0 ? 0 : Math.round((completed / dayTasks.length) * 100)

    const schedule = scheduleByDate[date]
    const focusMinutes = schedule
      ? (schedule.blocks || [])
          .filter(b => b.tag === 'study' || b.tag === 'work')
          .reduce((sum, b) => {
            const [sh, sm] = b.time.split(':').map(Number)
            const [eh, em] = b.endTime.split(':').map(Number)
            return sum + ((eh * 60 + em) - (sh * 60 + sm))
          }, 0)
      : 0

    totalTasks += dayTasks.length
    totalCompleted += completed
    totalFocusMinutes += focusMinutes

    const dObj = new Date(date + 'T12:00:00')
    const mood = journalEntries[date]?.mood

    return {
      date,
      label: dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      day: dObj.toLocaleDateString('en-US', { weekday: 'short' }),
      completionPct: pct,
      focusHours: Math.round((focusMinutes / 60) * 10) / 10,
      moodScore: mood ? MOOD_SCORES[mood] : null,
      mood,
    }
  })

  const avgCompletion = trendData.length === 0 ? 0 : Math.round(trendData.reduce((s, d) => s + d.completionPct, 0) / trendData.length)
  const totalFocusHoursText = totalFocusMinutes >= 60
    ? `${Math.floor(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m`
    : `${totalFocusMinutes}m`

  const tagDurations = {}
  schedules.forEach(s => {
    ;(s.blocks || []).forEach(b => {
      if (['wake', 'sleep'].includes(b.tag)) return
      const [sh, sm] = b.time.split(':').map(Number)
      const [eh, em] = b.endTime.split(':').map(Number)
      const dur = (eh * 60 + em) - (sh * 60 + sm)
      tagDurations[b.tag] = (tagDurations[b.tag] || 0) + dur
    })
  })

  const categoryData = Object.entries(tagDurations)
    .map(([tag, minutes]) => ({ name: tag, value: minutes, color: TAG_COLORS[tag] || '#888' }))
    .sort((a, b) => b.value - a.value)

  const moodCounts = {}
  Object.values(journalEntries).forEach(e => {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
  })
  const moodDistribution = Object.entries(moodCounts)
    .map(([mood, count]) => ({ name: mood, value: count, color: MOOD_COLORS[mood] }))
    .sort((a, b) => MOOD_SCORES[b.name] - MOOD_SCORES[a.name])
  const moodTotal = moodDistribution.reduce((s, x) => s + x.value, 0)

  let streak = 0
  for (let i = trendData.length - 1; i >= 0; i--) {
    if (trendData[i].completionPct > 0) streak++
    else break
  }

  // heatmap intensity levels (0-4) per day based on completion %
  const heatLevel = (pct) => {
    if (pct === 0) return 0
    if (pct < 30) return 1
    if (pct < 60) return 2
    if (pct < 90) return 3
    return 4
  }
  const heatColor = (level) => {
    const colors = [faint, 'rgba(255,77,0,0.25)', 'rgba(255,77,0,0.45)', 'rgba(255,77,0,0.7)', '#ff4d00']
    return colors[level]
  }

  const tooltipStyle = {
    backgroundColor: cardBg, border: `1px solid ${faint}`,
    borderRadius: '10px', fontSize: '12px', fontFamily: 'Inter, sans-serif',
    color: text,
  }

  const sectionLabel = (txt) => (
    <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
      {txt}
    </div>
  )

  return (
    <AppLayout>
      <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: '12px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '2px' }}>Insights</p>
            <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '38px', fontWeight: 700, color: text, letterSpacing: '-0.8px' }}>
              <span style={{ color: '#ff4d00' }}>Analytics</span>
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '4px', backgroundColor: cardBg, border: `1px solid ${faint}`, borderRadius: '10px', padding: '3px' }}>
            {RANGES.map(r => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                style={{
                  padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500, cursor: 'pointer',
                  border: 'none',
                  backgroundColor: range === r.key ? '#ff4d00' : 'transparent',
                  color: range === r.key ? 'white' : subtle,
                  transition: 'all 0.15s',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stat row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px', flexShrink: 0 }}>
          {[
            { label: 'Avg Completion', value: `${avgCompletion}%`, color: '#ff4d00' },
            { label: 'Tasks Completed', value: `${totalCompleted}/${totalTasks}`, color: '#5aad7a' },
            { label: 'Total Focus Time', value: totalFocusHoursText, color: '#4a90d9' },
            { label: 'Current Streak', value: `${streak} days`, color: '#8b6bc7' },
          ].map(s => (
            <div key={s.label} style={card()}>
              <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                {s.label}
              </div>
              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '22px', fontWeight: 700, color: s.color, letterSpacing: '-0.5px' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Bento grid — fills remaining space */}
        <div style={{
          flex: 1, minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '12px',
        }}>

          {/* Completion heatmap (top-left, like "Orders by time") */}
          <div style={{ ...card(), display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {sectionLabel('Completion Heatmap')}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', minHeight: 0, overflow: 'hidden' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${trendData.length}, 1fr)`,
                gap: '5px',
                width: '100%',
              }}>
                {trendData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div
                      title={`${d.label}: ${d.completionPct}%`}
                      style={{
                        width: '100%', aspectRatio: '1', borderRadius: '6px',
                        backgroundColor: heatColor(heatLevel(d.completionPct)),
                        transition: 'opacity 0.15s',
                      }}
                    />
                    {range <= 30 && (
                      <span style={{ fontSize: '8px', color: subtle, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>
                        {range <= 7 ? d.day : ''}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category breakdown (top-right, like "Sales by Country") */}
          <div style={{ ...card(), display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              {sectionLabel('Time by Category')}
            </div>
            {categoryData.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: subtle, fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                No schedule data yet
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignContent: 'start' }}>
                {categoryData.slice(0, 6).map((c, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 10px', borderRadius: '10px',
                    backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '11px', color: text, fontFamily: 'Inter, sans-serif', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif' }}>
                        {Math.round(c.value / 60 * 10) / 10}h
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completion + Focus trend line (bottom-left, like "Monthly Sales performance") */}
          <div style={{ ...card(), display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {sectionLabel('Completion & Focus Trend')}
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="label" stroke={subtle} tick={{ fontSize: 10, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#ff4d00" tick={{ fontSize: 10, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} domain={[0, 100]} width={28} />
                  <YAxis yAxisId="right" orientation="right" stroke="#4a90d9" tick={{ fontSize: 10, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: text }} />
                  <Line yAxisId="left" type="monotone" dataKey="completionPct" name="Completion %" stroke="#ff4d00" strokeWidth={2} dot={{ r: 2 }} />
                  <Line yAxisId="right" type="monotone" dataKey="focusHours" name="Focus hrs" stroke="#4a90d9" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mood distribution (bottom-right, like "Top Product Sales" table) */}
          <div style={{ ...card(), display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {sectionLabel('Mood Breakdown')}
            {moodDistribution.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: subtle, fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                No mood data yet
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', overflowY: 'auto' }}>
                {moodDistribution.map(m => {
                  const pct = Math.round((m.value / moodTotal) * 100)
                  return (
                    <div key={m.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', color: text, fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>{m.name}</span>
                        <span style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{m.value}d · {pct}%</span>
                      </div>
                      <div style={{ height: '5px', backgroundColor: faint, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: m.color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
                      </div>
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