import { useState, useEffect, useCallback } from 'react'
import {
  LineChart, Line,
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
import { dateRange } from '../utils/date'

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
  return dateRange(days)
}

// ── Paywall Component ─────────────────────────────────────────
function Paywall({ onUnlock }) {
  const { user } = useAuth()
  const { theme } = useTheme()
  const dark = theme === 'dark'
const [loading, setLoading] = useState(null)
const [error, setError] = useState('')
const [glarePos, setGlarePos] = useState({})
const [gateway, setGateway] = useState('razorpay') // 'razorpay' | 'paypal'

  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)'
  const cardBg = dark ? '#111111' : '#ffffff'
  const cardBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  // const plans = [
  //   {
  //     key: 'free',
  //     label: 'Free',
  //     badge: null,
  //     desc: 'Good for getting started.',
  //     price: '₹0',
  //     suffix: '/mo',
  //     featured: false,
  //     cta: 'Current plan',
  //     disabled: true,
  //     features: [
  //       { text: 'Dashboard & streaks', available: true },
  //       { text: 'AI schedule generation', available: true },
  //       { text: 'Journal entries', available: true },
  //       { text: 'Analytics', available: false },
  //       { text: 'Mood insights', available: false },
  //     ],
  //   },
  //   {
  //     key: 'monthly',
  //     label: 'Pro',
  //     badge: 'Popular',
  //     desc: 'For people who want more.',
  //     price: billedYearly ? '₹149' : '₹199',
  //     suffix: '/mo',
  //     featured: true,
  //     cta: 'Get started',
  //     disabled: false,
  //     features: [
  //       { text: 'Everything in Free', available: true },
  //       { text: 'Complete Analytics', available: true },
  //       { text: 'Mood vs productivity', available: true },
  //       { text: 'Focus time trends', available: true },
  //       { text: 'Unlimited history', available: true },
  //     ],
  //   },
  //   {
  //     key: 'lifetime',
  //     label: 'Lifetime',
  //     badge: 'Best value',
  //     desc: 'Pay once, use forever.',
  //     price: '₹999',
  //     suffix: '',
  //     featured: false,
  //     cta: 'Get started',
  //     disabled: false,
  //     features: [
  //       { text: 'Everything in Pro', available: true },
  //       { text: 'All future features', available: true },
  //       { text: 'Priority support', available: true },
  //       { text: 'Early access', available: true },
  //       { text: 'Never pay again', available: true },
  //     ],
  //   },
  // ]


const plans = [
  {
    key: 'free',
    label: 'Free',
    badge: null,
    desc: 'Good for getting started.',
    price: { razorpay: '₹0', paypal: '$0' },
    suffix: '/mo',
    featured: false,
    cta: 'Current plan',
    disabled: true,
    features: [
      { text: 'Dashboard & streaks', available: true },
      { text: 'AI schedule generation', available: true },
      { text: 'Journal entries', available: true },
      { text: 'Analytics', available: false },
      { text: 'Mood insights', available: false },
    ],
  },
  {
    key: 'monthly',
    label: 'Pro',
    badge: 'Popular',
    desc: 'For people who want more.',
    price: {
      razorpay: '₹199',
      paypal: '$3',
    },
    suffix: '/mo',
    featured: true,
    cta: 'Get started',
    disabled: false,
    features: [
      { text: 'Everything in Free', available: true },
      { text: 'Complete Analytics', available: true },
      { text: 'Mood vs productivity', available: true },
      { text: 'Focus time trends', available: true },
      { text: 'Unlimited history', available: true },
    ],
  },
  {
    key: 'lifetime',
    label: 'Lifetime',
    badge: 'Best value',
    desc: 'Pay once, use forever.',
    price: { razorpay: '₹999', paypal: '$15' },
    suffix: '',
    featured: false,
    cta: 'Get started',
    disabled: false,
    features: [
      { text: 'Everything in Pro', available: true },
      { text: 'All future features', available: true },
      { text: 'Priority support', available: true },
      { text: 'Early access', available: true },
      { text: 'Never pay again', available: true },
    ],
  },
]


const loadPayPalScript = (clientId) =>
  new Promise((resolve) => {
    if (document.getElementById('paypal-sdk')) return resolve(true)
    const script = document.createElement('script')
    script.id = 'paypal-sdk'
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

useEffect(() => {
  if (gateway !== 'paypal') return

  const renderPayPalButtons = async () => {
    try {
      const { clientId } = await paymentApi.getPayPalConfig()
      const loaded = await loadPayPalScript(clientId)
      if (!loaded) return

      // Render a button for each non-free plan
      ;['monthly', 'lifetime'].forEach(planKey => {
        const container = document.getElementById(`paypal-button-${planKey}`)
        if (!container || container.children.length > 0) return

        window.paypal.Buttons({
          createOrder: async () => {
            const o = await paymentApi.createPayPalOrder(planKey)
            return o.orderId
          },
          onApprove: async (data) => {
            try {
              const result = await paymentApi.capturePayPalOrder(data.orderID)
              if (result.success) onUnlock(result.user)
            } catch {
              setError('PayPal payment verification failed. Contact support.')
            }
            setLoading(null)
          },
          onCancel: () => setLoading(null),
          onError: () => {
            setError('PayPal payment failed. Please try again.')
            setLoading(null)
          },
          style: {
            layout: 'vertical',
            color: 'black',
            shape: 'rect',
            label: 'pay',
            height: 44,
          },
        }).render(`#paypal-button-${planKey}`)
      })
    } catch (err) {
      console.error('PayPal render error:', err)
    }
  }

  renderPayPalButtons()
}, [gateway, onUnlock])

const handleRazorpayPayment = async (planKey) => {
  if (planKey === 'free') return
  setLoading(planKey)
  setError('')
  try {
    const loaded = await loadRazorpay()
    if (!loaded) throw new Error('Razorpay failed to load.')
    const order = await paymentApi.createOrder(planKey)
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'SYNQ',
      description: planKey === 'lifetime' ? 'SYNQ Lifetime Access' : 'SYNQ Pro Monthly',
      order_id: order.orderId,
      prefill: { name: user?.name || '', email: user?.email || '' },
      theme: { color: '#ff4d00' },
      handler: async (response) => {
        try {
          const result = await paymentApi.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          if (result.success) onUnlock(result.user)
        } catch {
          setError('Payment verification failed. Contact support.')
        } finally {
          setLoading(null)
        }
      },
      modal: { ondismiss: () => setLoading(null) },
    }
    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', () => {
      setError('Payment failed. Please try again.')
      setLoading(null)
    })
    rzp.open()
  } catch (err) {
    setError(err.message || 'Something went wrong.')
    setLoading(null)
  }
}


  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  // const handlePayment = async (planKey) => {
  //   if (planKey === 'free') return
  //   setLoading(planKey)
  //   setError('')
  //   try {
  //     const loaded = await loadRazorpay()
  //     if (!loaded) throw new Error('Razorpay failed to load.')
  //     const order = await paymentApi.createOrder(planKey)
  //     const options = {
  //       key: order.keyId,
  //       amount: order.amount,
  //       currency: order.currency,
  //       name: 'SYNQ',
  //       description: planKey === 'lifetime' ? 'SYNQ Lifetime Access' : 'SYNQ Pro Monthly',
  //       order_id: order.orderId,
  //       prefill: { name: user?.name || '', email: user?.email || '' },
  //       theme: { color: '#ff4d00' },
  //       handler: async (response) => {
  //         try {
  //           const result = await paymentApi.verifyPayment({
  //             razorpay_order_id: response.razorpay_order_id,
  //             razorpay_payment_id: response.razorpay_payment_id,
  //             razorpay_signature: response.razorpay_signature,
  //             plan: planKey,
  //           })
  //           if (result.success) onUnlock(result.user)
  //         } catch {
  //           setError('Payment verification failed. Contact support.')
  //         }
  //       },
  //       modal: { ondismiss: () => setLoading(null) },
  //     }
  //     const rzp = new window.Razorpay(options)
  //     rzp.on('payment.failed', () => {
  //       setError('Payment failed. Please try again.')
  //       setLoading(null)
  //     })
  //     rzp.open()
  //   } catch (err) {
  //     setError(err.message || 'Something went wrong.')
  //     setLoading(null)
  //   }
  // }
  const handlePayment = (planKey) => {
  if (gateway === 'paypal') return
  handleRazorpayPayment(planKey)
}

  const handleMouseMove = (e, key) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setGlarePos(prev => ({ ...prev, [key]: { x, y } }))
  }

  const handleMouseLeave = (key) => {
    setGlarePos(prev => ({ ...prev, [key]: null }))
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
    }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
  <h1
    style={{
      fontFamily: 'Bricolage Grotesque, sans-serif',
      fontSize: 'clamp(28px, 4vw, 40px)',
      fontWeight: 700,
      color: text,
      letterSpacing: '-0.03em',
      marginBottom: '12px',
      lineHeight: 1.1,
    }}
  >
    Simple, transparent pricing
  </h1>

  <p
    style={{
      fontSize: '15px',
      color: subtle,
      fontFamily: 'Inter, sans-serif',
      maxWidth: '420px',
      lineHeight: 1.6,
      margin: '0 auto',
    }}
  >
    Start free. Upgrade when you want deeper insights into your day.
  </p>
</div>

{/* Gateway toggle */}
<div style={{
  display: 'flex', alignItems: 'center', gap: '8px',
  marginBottom: '28px',
  backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
  border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
  borderRadius: '12px', padding: '4px',
}}>
  {[
    {
      key: 'razorpay',
      label: 'Razorpay',
      flag: '🇮🇳',
      sub: 'UPI · Cards · Netbanking',
    },
    {
      key: 'paypal',
      label: 'PayPal',
      flag: '🌍',
      sub: 'International · Cards',
    },
  ].map(g => (
    <button
      key={g.key}
      onClick={() => setGateway(g.key)}
      style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 16px', borderRadius: '9px', border: 'none',
        cursor: 'pointer', transition: 'all 0.15s',
        backgroundColor: gateway === g.key
          ? dark ? '#1a1a1a' : '#fff'
          : 'transparent',
        boxShadow: gateway === g.key
          ? '0 2px 8px rgba(0,0,0,0.15)'
          : 'none',
      }}
    >
      <span style={{ fontSize: '18px' }}>{g.flag}</span>
      <div style={{ textAlign: 'left' }}>
        <div style={{
          fontSize: '13px', fontWeight: 600,
          color: gateway === g.key ? text : subtle,
          fontFamily: 'Inter, sans-serif',
        }}>
          {g.label}
        </div>
        <div style={{
          fontSize: '10px', color: subtle,
          fontFamily: 'Inter, sans-serif',
          opacity: gateway === g.key ? 1 : 0.6,
        }}>
          {g.sub}
        </div>
      </div>
      {gateway === g.key && (
        <div style={{
          marginLeft: 'auto', width: '7px', height: '7px',
          borderRadius: '50%', backgroundColor: '#ff4d00',
          flexShrink: 0,
        }} />
      )}
    </button>
  ))}
</div>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 340px)',
        gap: '20px',
        alignItems: 'center',
      }}>
        {plans.map((plan) => {
          const glare = glarePos[plan.key]
          return (
            <div
              key={plan.key}
              onMouseMove={(e) => handleMouseMove(e, plan.key)}
              onMouseLeave={() => handleMouseLeave(plan.key)}
              style={{
                position: 'relative',
                borderRadius: '16px',
                backgroundColor: cardBg,
                border: `1px solid ${plan.featured ? 'rgba(255,255,255,0.14)' : cardBorder}`,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0px',
                overflow: 'hidden',
                transform: plan.featured ? 'scale(1.04)' : 'scale(1)',
                boxShadow: plan.featured
                  ? '0 0 0 1px rgba(255,255,255,0.06), 0 24px 60px rgba(0,0,0,0.5)'
                  : '0 4px 20px rgba(0,0,0,0.2)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
            >
              {/* Glare overlay */}
              {glare && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '16px',
                  background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
                  pointerEvents: 'none', zIndex: 2,
                  transition: 'opacity 0.3s',
                }} />
              )}

              {/* Card content */}
              <div style={{ position: 'relative', zIndex: 1 }}>

                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    fontSize: '20px', fontWeight: 600, color: text,
                    letterSpacing: '-0.02em',
                  }}>
                    {plan.label}
                  </div>
                  {plan.badge && (
                    <div style={{
                      padding: '3px 10px', borderRadius: '100px',
                      backgroundColor: plan.featured ? '#ff4d00' : 'rgba(255,255,255,0.08)',
                      border: `1px solid ${plan.featured ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                      fontSize: '11px', fontWeight: 600,
                      color: plan.featured ? 'white' : subtle,
                      fontFamily: 'Inter, sans-serif',
                    }}>
                      {plan.badge}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div style={{
                  fontSize: '13px', color: subtle,
                  fontFamily: 'Inter, sans-serif', marginBottom: '16px',
                }}>
                  {plan.desc}
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '20px' }}>
                  <span style={{
  fontFamily: 'Bricolage Grotesque, sans-serif',
  fontSize: plan.price[gateway] === '₹0' || plan.price[gateway] === '$0' ? '48px' : '44px',
  fontWeight: 600, color: text,
  letterSpacing: '-0.03em', lineHeight: 1,
  display: 'flex', alignItems: 'baseline', gap: '2px',
}}>
  {plan.price[gateway]}
                  </span>
                  {plan.suffix && (
                    <span style={{ fontSize: '14px', color: subtle, fontFamily: 'Inter, sans-serif' }}>
                      {plan.suffix}
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', marginBottom: '20px' }} />

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {f.available ? (
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
                          <path d="M12.5 3.5L6 10L2.5 6.5" stroke={text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
                          <circle cx="7.5" cy="7.5" r="1.5" fill={subtle} opacity="0.4" />
                        </svg>
                      )}
                      <span style={{
                        fontSize: '13px',
                        color: f.available ? text : subtle,
                        fontFamily: 'Inter, sans-serif',
                        opacity: f.available ? 0.85 : 0.5,
                      }}>
                        {f.text}
                        {!f.available && (
                          <span style={{ marginLeft: '6px', fontSize: '11px', color: subtle, opacity: 0.6 }}>
                            locked
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
{/* PayPal button container — always rendered when PayPal selected */}
{gateway === 'paypal' && !plan.disabled && (
  <div id={`paypal-button-${plan.key}`} style={{ marginTop: '4px', minHeight: '44px' }} />
)}

{/* Razorpay button — only shown when Razorpay selected */}
{gateway === 'razorpay' && (
<button
  onClick={() => handlePayment(plan.key)}
  disabled={plan.disabled || loading === plan.key}
                  style={{
                    width: '100%', padding: '12px',
                    borderRadius: '8px', border: 'none',
                    fontSize: '14px', fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                    cursor: plan.disabled ? 'default' : 'pointer',
                    backgroundColor: plan.featured
                      ? '#ff4d00'
                      : dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    color: plan.featured ? 'white' : text,
                    opacity: plan.disabled ? 0.4 : 1,
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                  onMouseEnter={e => {
                    if (!plan.disabled && plan.featured) e.currentTarget.style.backgroundColor = '#e04400'
                    if (!plan.disabled && !plan.featured) e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={e => {
                    if (plan.featured) e.currentTarget.style.backgroundColor = '#ff4d00'
                    else e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
                  }}
                >
                  {loading === plan.key ? (
                    <>
                      <div style={{
                        width: '14px', height: '14px',
                        border: `2px solid ${plan.featured ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                        borderTop: `2px solid ${plan.featured ? 'white' : text}`,
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                      Processing...
                    </>
                  ) : plan.disabled ? plan.cta : `${plan.cta} · ${plan.price[gateway]}${plan.suffix}`}
              </button>
            )}
          </div>
        </div>
      )
    })}
  </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '20px', padding: '10px 18px', borderRadius: '10px',
          backgroundColor: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.25)',
          fontSize: '13px', color: '#ff4d00', fontFamily: 'Inter, sans-serif',
        }}>
          {error}
        </div>
      )}

      {/* Trust line */}
      <div style={{
        marginTop: '20px', fontSize: '12px',
        color: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
        fontFamily: 'Inter, sans-serif',
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="11" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M8 11V7C8 4.79 9.79 3 12 3C14.21 3 16 4.79 16 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Secured by Razorpay · UPI, Cards, Netbanking accepted
      </div>

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

  useEffect(() => {
    let cancelled = false
    const loadData = async () => {
    setLoading(true)
    try {
      const dates = getDateRange(range)
      const [allSchedules, allJournal, allTasks] = await Promise.all([
        scheduleApi.getAllSchedules(),
        journalApi.getAllEntries(),
        taskApi.getAllTasks(),
      ])
      if (cancelled) return
      const tByDate = {}
      dates.forEach(d => { tByDate[d] = [] })
      ;(allTasks || []).forEach(task => {
        if (tByDate[task.date]) tByDate[task.date].push(task)
      })
      setTasksByDate(tByDate)
      const dateSet = new Set(dates)
      setSchedules((allSchedules || []).filter(s => dateSet.has(s.date)))
      const jByDate = {}
      ;(allJournal || []).forEach(e => { if (dateSet.has(e.date)) jByDate[e.date] = e })
      setJournalEntries(jByDate)
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      if (!cancelled) setLoading(false)
    }
    }
    loadData()
    return () => { cancelled = true }
  }, [range])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: subtle, fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
      Loading analytics...
    </div>
  )

  const dates = getDateRange(range)
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
    const dObj = new Date(date + 'T12:00:00')
    const mood = journalEntries[date]?.mood
    return {
      date, label: dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completionPct: pct, focusHours: Math.round((focusMinutes / 60) * 10) / 10,
      moodScore: mood ? MOOD_SCORES[mood] : null, mood, focusMinutes,
    }
  })

  const totals = trendData.reduce((result, day) => {
    const dayTasks = tasksByDate[day.date] || []
    result.tasks += dayTasks.length
    result.completed += dayTasks.filter(task => task.status === 'completed').length
    result.focusMinutes += day.focusMinutes
    return result
  }, { tasks: 0, completed: 0, focusMinutes: 0 })
  const { tasks: totalTasks, completed: totalCompleted, focusMinutes: totalFocusMinutes } = totals

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
  const [checking, setChecking] = useState(() => Boolean(token))

  useEffect(() => {
    // Always verify premium status from server, not just user object
    if (token) {
      paymentApi.getStatus()
        .then(data => setIsPremium(data.isPremium))
        .catch(() => setIsPremium(false))
        .finally(() => setChecking(false))
    }
  }, [token])

  const handleUnlock = useCallback(() => {
    setIsPremium(true)
  }, [])

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
