import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import AppLayout from '../components/common/AppLayout'
import LoadingSplash from '../components/common/LoadingSplash'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import * as taskApi from '../api/tasks'
import * as scheduleApi from '../api/schedule'
import * as journalApi from '../api/journal'
import * as paymentApi from '../api/payment'

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

// ── Paywall Component ─────────────────────────────────────────
function Paywall({ onUnlock }) {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const { user, login } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
  const faint = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const cardBg = dark ? '#161616' : '#ffffff'

  const plans = [
    {
      key: 'monthly',
      label: 'Monthly',
      price: '₹199',
      period: '/month',
      desc: 'Full access, cancel anytime',
      features: ['Complete Analytics dashboard', 'Mood vs productivity insights', 'Focus time trends', 'Weekly/monthly reports'],
    },
    {
      key: 'lifetime',
      label: 'Lifetime',
      price: '₹999',
      period: 'one-time',
      desc: 'Pay once, own it forever',
      badge: 'Best value',
      features: ['Everything in Monthly', 'All future features', 'Priority support', 'Never pay again'],
    },
  ]

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const handlePayment = async () => {
    setLoading(true)
    setError('')
    try {
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Razorpay failed to load. Check your connection.')

      const order = await paymentApi.createOrder(selectedPlan)

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'SYNQ',
        description: selectedPlan === 'lifetime' ? 'SYNQ Lifetime Access' : 'SYNQ Monthly Premium',
        order_id: order.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#ff4d00' },
        handler: async (response) => {
          try {
            const result = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: selectedPlan,
            })
            if (result.success) {
              onUnlock(result.user)
            }
          } catch (err) {
            setError('Payment verification failed. Contact support.')
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => {
        setError('Payment failed. Please try again.')
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: 'calc(100vh - 80px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
    }}>
      {/* Lock icon */}
      <div style={{
        width: '64px', height: '64px', borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(255,77,0,0.2), rgba(255,77,0,0.05))',
        border: '1px solid rgba(255,77,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
        boxShadow: '0 0 40px rgba(255,77,0,0.15)',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="11" width="14" height="11" rx="2" stroke="#ff4d00" strokeWidth="2" fill="rgba(255,77,0,0.1)" />
          <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="#ff4d00" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1.5" fill="#ff4d00" />
        </svg>
      </div>

      {/* Headline */}
      <h1 style={{
        fontFamily: 'Bricolage Grotesque, sans-serif',
        fontSize: '28px', fontWeight: 700, color: text,
        letterSpacing: '-0.5px', marginBottom: '8px', textAlign: 'center',
      }}>
        Unlock <span style={{ color: '#ff4d00' }}>Analytics</span>
      </h1>
      <p style={{
        fontSize: '14px', color: subtle, fontFamily: 'Inter, sans-serif',
        textAlign: 'center', maxWidth: '380px', lineHeight: 1.6, marginBottom: '36px',
      }}>
        See how your mood, focus time, and completion rate connect. Know your patterns, own your day.
      </p>

      {/* Plan toggle */}
      <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '520px', marginBottom: '24px' }}>
        {plans.map(plan => (
          <div
            key={plan.key}
            onClick={() => setSelectedPlan(plan.key)}
            style={{
              flex: 1, padding: '20px', borderRadius: '16px', cursor: 'pointer',
              backgroundColor: cardBg,
              border: `1.5px solid ${selectedPlan === plan.key ? '#ff4d00' : faint}`,
              boxShadow: selectedPlan === plan.key ? '0 0 0 3px rgba(255,77,0,0.1)' : 'none',
              transition: 'all 0.2s',
              position: 'relative',
            }}
          >
            {plan.badge && (
              <div style={{
                position: 'absolute', top: '-10px', right: '14px',
                backgroundColor: '#ff4d00', color: 'white',
                fontSize: '10px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                padding: '3px 10px', borderRadius: '100px',
              }}>
                {plan.badge}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%',
                border: `2px solid ${selectedPlan === plan.key ? '#ff4d00' : faint}`,
                backgroundColor: selectedPlan === plan.key ? '#ff4d00' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {selectedPlan === plan.key && (
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'white' }} />
                )}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: text, fontFamily: 'Inter, sans-serif' }}>
                {plan.label}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, color: '#ff4d00', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                {plan.price}
              </span>
              <span style={{ fontSize: '12px', color: subtle, fontFamily: 'Inter, sans-serif' }}>
                {plan.period}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '12px' }}>
              {plan.desc}
            </div>
            {plan.features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" fill="rgba(255,77,0,0.15)" stroke="rgba(255,77,0,0.3)" />
                  <path d="M3.5 6L5 7.5L8.5 4" stroke="#ff4d00" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{f}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {error && (
        <div style={{
          padding: '10px 16px', borderRadius: '10px', marginBottom: '16px',
          backgroundColor: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.3)',
          fontSize: '13px', color: '#ff4d00', fontFamily: 'Inter, sans-serif',
          maxWidth: '520px', width: '100%',
        }}>
          {error}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          width: '100%', maxWidth: '520px',
          padding: '14px', borderRadius: '12px',
          backgroundColor: loading ? 'rgba(255,77,0,0.5)' : '#ff4d00',
          color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '15px', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700,
          transition: 'all 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: '16px', height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            Processing...
          </>
        ) : (
          `Unlock with ${selectedPlan === 'lifetime' ? '₹999' : '₹199/mo'} →`
        )}
      </button>

      <p style={{
        fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif',
        marginTop: '12px', textAlign: 'center',
      }}>
        Secured by Razorpay · UPI, Cards, Netbanking accepted
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

// ── Analytics Dashboard ───────────────────────────────────────
function AnalyticsDashboard() {
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
    borderRadius: '16px',
    padding: '18px',
    ...extra,
  })

  useEffect(() => { loadData() }, [range])

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
      console.error('Failed to load analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: subtle, fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
      Loading analytics...
    </div>
  )

  const dates = getDateRange(range)
  let totalTasks = 0, totalCompleted = 0, totalFocusMinutes = 0
  const scheduleByDate = {}
  schedules.forEach(s => { scheduleByDate[s.date] = s })

  const trendData = dates.map(date => {
    const dayTasks = tasksByDate[date] || []
    const completed = dayTasks.filter(t => t.status === 'completed').length
    const pct = dayTasks.length === 0 ? 0 : Math.round((completed / dayTasks.length) * 100)
    const schedule = scheduleByDate[date]
    const focusMinutes = schedule ? (schedule.blocks || []).filter(b => b.tag === 'study' || b.tag === 'work').reduce((sum, b) => {
      const [sh, sm] = b.time.split(':').map(Number)
      const [eh, em] = b.endTime.split(':').map(Number)
      return sum + ((eh * 60 + em) - (sh * 60 + sm))
    }, 0) : 0
    totalTasks += dayTasks.length
    totalCompleted += completed
    totalFocusMinutes += focusMinutes
    const dObj = new Date(date + 'T12:00:00')
    const mood = journalEntries[date]?.mood
    return {
      date, label: dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completionPct: pct, focusHours: Math.round((focusMinutes / 60) * 10) / 10,
      moodScore: mood ? MOOD_SCORES[mood] : null, mood,
    }
  })

  const avgCompletion = trendData.length === 0 ? 0 : Math.round(trendData.reduce((s, d) => s + d.completionPct, 0) / trendData.length)
  const totalFocusHoursText = totalFocusMinutes >= 60 ? `${Math.floor(totalFocusMinutes / 60)}h ${totalFocusMinutes % 60}m` : `${totalFocusMinutes}m`

  const tagDurations = {}
  schedules.forEach(s => {
    ;(s.blocks || []).forEach(b => {
      if (['wake', 'sleep'].includes(b.tag)) return
      const [sh, sm] = b.time.split(':').map(Number)
      const [eh, em] = b.endTime.split(':').map(Number)
      tagDurations[b.tag] = (tagDurations[b.tag] || 0) + ((eh * 60 + em) - (sh * 60 + sm))
    })
  })

  const moodCounts = {}
  Object.values(journalEntries).forEach(e => { if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1 })
  const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({ name: mood, value: count, color: MOOD_COLORS[mood] })).sort((a, b) => MOOD_SCORES[b.name] - MOOD_SCORES[a.name])
  const moodTotal = moodDistribution.reduce((s, x) => s + x.value, 0)

  let streak = 0
  for (let i = trendData.length - 1; i >= 0; i--) {
    if (trendData[i].completionPct > 0) streak++
    else break
  }

  const tooltipStyle = { backgroundColor: cardBg, border: `1px solid ${faint}`, borderRadius: '10px', fontSize: '12px', fontFamily: 'Inter, sans-serif', color: text }
  const heatLevel = (pct) => pct === 0 ? 0 : pct < 30 ? 1 : pct < 60 ? 2 : pct < 90 ? 3 : 4
  const heatColor = (level) => ['rgba(255,255,255,0.05)', 'rgba(255,77,0,0.25)', 'rgba(255,77,0,0.45)', 'rgba(255,77,0,0.7)', '#ff4d00'][level]
  const sectionLabel = (txt) => (
    <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>{txt}</div>
  )

  return (
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: '12px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '2px' }}>Insights</p>
          <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '28px', fontWeight: 700, color: text, letterSpacing: '-0.8px' }}>
            <span style={{ color: '#ff4d00' }}>Analytics</span>
            <span style={{ marginLeft: '8px', fontSize: '12px', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(255,77,0,0.15)', color: '#ff4d00', fontFamily: 'Inter, sans-serif', fontWeight: 600, verticalAlign: 'middle' }}>PREMIUM</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '4px', backgroundColor: cardBg, border: `1px solid ${faint}`, borderRadius: '10px', padding: '3px' }}>
          {RANGES.map(r => (
            <button key={r.key} onClick={() => setRange(r.key)} style={{
              padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
              fontFamily: 'Inter, sans-serif', fontWeight: 500, cursor: 'pointer', border: 'none',
              backgroundColor: range === r.key ? '#ff4d00' : 'transparent',
              color: range === r.key ? 'white' : subtle, transition: 'all 0.15s',
            }}>{r.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px', flexShrink: 0 }}>
        {[
          { label: 'Avg Completion', value: `${avgCompletion}%`, color: '#ff4d00' },
          { label: 'Tasks Completed', value: `${totalCompleted}/${totalTasks}`, color: '#5aad7a' },
          { label: 'Total Focus Time', value: totalFocusHoursText, color: '#4a90d9' },
          { label: 'Current Streak', value: `${streak} days`, color: '#8b6bc7' },
        ].map(s => (
          <div key={s.label} style={card()}>
            <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '22px', fontWeight: 700, color: s.color, letterSpacing: '-0.5px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gridTemplateRows: '1fr 1fr', gap: '12px' }}>
        <div style={{ ...card(), display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {sectionLabel('Completion Heatmap')}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', minHeight: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${trendData.length}, 1fr)`, gap: '5px', width: '100%' }}>
              {trendData.map((d, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div title={`${d.label}: ${d.completionPct}%`} style={{ width: '100%', aspectRatio: '1', borderRadius: '6px', backgroundColor: heatColor(heatLevel(d.completionPct)) }} />
                  {range <= 7 && <span style={{ fontSize: '8px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{d.label.split(' ')[1]}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...card(), display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {sectionLabel('Time by Category')}
          {Object.keys(tagDurations).length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: subtle, fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>No schedule data yet</div>
          ) : (
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', alignContent: 'start', overflowY: 'auto' }}>
              {Object.entries(tagDurations).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tag, minutes], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '10px', backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: TAG_COLORS[tag] || '#888', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', color: text, fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>{tag}</div>
                    <div style={{ fontSize: '10px', color: subtle, fontFamily: 'Inter, sans-serif' }}>{Math.round(minutes / 60 * 10) / 10}h</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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

        <div style={{ ...card(), display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {sectionLabel('Mood Breakdown')}
          {moodDistribution.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: subtle, fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>No mood data yet</div>
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
  )
}

// ── Main Export ───────────────────────────────────────────────
export default function Analytics() {
  const { user, token } = useAuth()
  const [isPremium, setIsPremium] = useState(user?.isPremium || false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Always verify premium status from server, not just user object
    if (token) {
      paymentApi.getStatus()
        .then(data => setIsPremium(data.isPremium))
        .catch(() => setIsPremium(false))
        .finally(() => setChecking(false))
    } else {
      setChecking(false)
    }
  }, [token])

  const handleUnlock = (updatedUser) => {
    setIsPremium(true)
  }

  if (checking) {
    return (
      <AppLayout>
        <LoadingSplash label="Checking your access..." />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {isPremium ? (
        <AnalyticsDashboard />
      ) : (
        <Paywall onUnlock={handleUnlock} />
      )}
    </AppLayout>
  )
}
