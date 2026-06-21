import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import AppLayout from '../components/common/AppLayout'
import LoadingSplash from '../components/common/LoadingSplash'
import { useTheme } from '../context/ThemeContext'
import * as taskApi from '../api/tasks'
import * as scheduleApi from '../api/schedule'
import * as journalApi from '../api/journal'

const RANGES = [
  { key: 7, label: '7 days' },
  { key: 30, label: '30 days' },
  { key: 90, label: '90 days' },
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
    borderRadius: '18px',
    padding: '24px',
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
      console.error('Failed to load analytics data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <LoadingSplash label="Crunching your numbers..." />
      </AppLayout>
    )
  }

  const dates = getDateRange(range)

  // ── Summary stats ──────────────────────────────────────────
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

  // ── Category breakdown ─────────────────────────────────────
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

  // ── Mood correlation ───────────────────────────────────────
  const moodData = trendData.filter(d => d.moodScore !== null)
  const moodCounts = {}
  Object.values(journalEntries).forEach(e => {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
  })
  const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
    name: mood, value: count, color: MOOD_COLORS[mood],
  }))

  // current streak (consecutive days with at least 1 completed task, from today backward)
  let streak = 0
  for (let i = trendData.length - 1; i >= 0; i--) {
    if (trendData[i].completionPct > 0) streak++
    else break
  }

  const tooltipStyle = {
    backgroundColor: cardBg, border: `1px solid ${faint}`,
    borderRadius: '10px', fontSize: '12px', fontFamily: 'Inter, sans-serif',
    color: text,
  }

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <p style={{ fontSize: '13px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>Insights</p>
          <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '36px', fontWeight: 700, color: text, letterSpacing: '-1px' }}>
            <span style={{ color: '#ff4d00' }}>Analytics</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '6px', backgroundColor: cardBg, border: `1px solid ${faint}`, borderRadius: '10px', padding: '4px' }}>
          {RANGES.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              style={{
                padding: '7px 14px', borderRadius: '8px', fontSize: '12px',
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

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
        {[
          { label: 'Avg Completion', value: `${avgCompletion}%`, color: '#ff4d00' },
          { label: 'Tasks Completed', value: `${totalCompleted}/${totalTasks}`, color: '#5aad7a' },
          { label: 'Total Focus Time', value: totalFocusHoursText, color: '#4a90d9' },
          { label: 'Current Streak', value: `${streak} days`, color: '#8b6bc7' },
        ].map(s => (
          <div key={s.label} style={card()}>
            <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '28px', fontWeight: 700, color: s.color, letterSpacing: '-0.5px' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Completion trend */}
      <div style={{ ...card(), marginBottom: '16px' }}>
        <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '16px', fontWeight: 600, color: text, marginBottom: '16px' }}>
          Completion Trend
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="label" stroke={subtle} tick={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
            <YAxis stroke={subtle} tick={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: text }} />
            <Line type="monotone" dataKey="completionPct" name="Completion %" stroke="#ff4d00" strokeWidth={2.5} dot={{ r: 3, fill: '#ff4d00' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Focus hours bar */}
        <div style={card()}>
          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '16px', fontWeight: 600, color: text, marginBottom: '16px' }}>
            Focus Hours
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="label" stroke={subtle} tick={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
              <YAxis stroke={subtle} tick={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: text }} cursor={false} />
<Bar dataKey="focusHours" name="Focus hrs" fill="#ff4d00" radius={[4, 4, 0, 0]} activeBar={{ fill: '#ff4d00' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div style={card()}>
          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '16px', fontWeight: 600, color: text, marginBottom: '16px' }}>
            Time by Category
          </div>
          {categoryData.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: subtle, fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
              No schedule data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) => [`${Math.round(value / 60 * 10) / 10}h`, name]}
                />
                <Legend
                  formatter={(value) => <span style={{ color: subtle, fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>{value}</span>}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Mood correlation */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        <div style={card()}>
          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '16px', fontWeight: 600, color: text, marginBottom: '4px' }}>
            Mood vs Completion
          </div>
          <div style={{ fontSize: '12px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>
            See how your mood tracks with how much you got done
          </div>
          {moodData.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: subtle, fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
              No journal entries with mood yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="label" stroke={subtle} tick={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" stroke="#ff4d00" tick={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" stroke="#8b6bc7" tick={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} domain={[0, 5]} />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: text }} />
                <Line yAxisId="left" type="monotone" dataKey="completionPct" name="Completion %" stroke="#ff4d00" strokeWidth={2} dot={{ r: 2 }} />
                <Line yAxisId="right" type="monotone" dataKey="moodScore" name="Mood (1-5)" stroke="#8b6bc7" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Mood distribution */}
        <div style={card()}>
          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '16px', fontWeight: 600, color: text, marginBottom: '16px' }}>
            Mood Distribution
          </div>
          {moodDistribution.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: subtle, fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
              No mood data yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {moodDistribution
                .sort((a, b) => MOOD_SCORES[b.name] - MOOD_SCORES[a.name])
                .map(m => {
                  const total = moodDistribution.reduce((s, x) => s + x.value, 0)
                  const pct = Math.round((m.value / total) * 100)
                  return (
                    <div key={m.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', color: text, fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>{m.name}</span>
                        <span style={{ fontSize: '12px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{m.value} days</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: faint, borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: m.color, borderRadius: '3px' }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
