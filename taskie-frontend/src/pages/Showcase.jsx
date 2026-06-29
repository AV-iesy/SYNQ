import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import InfinityIcon from '../components/common/InfinityIcon'
import Iphone from '../components/common/Iphone'

// ── Design tokens for phone-screen content ──────────────────
const T = {
  textPrimary: 'rgba(255,255,255,0.94)',
  textSecondary: 'rgba(255,255,255,0.6)',
  textTertiary: 'rgba(255,255,255,0.4)',
  glassBg: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.09)',
  glassHighlight: 'inset 0 1px 0 rgba(255,255,255,0.08)',
  s1: '4px', s2: '8px', s3: '12px', s4: '16px', s6: '24px',
}

// Reusable glass card with inner highlight + soft gradient
function GlassCard({ children, style = {} }) {
  return (
    <div style={{
      backgroundColor: T.glassBg,
      border: `1px solid ${T.glassBorder}`,
      borderRadius: '12px',
      boxShadow: `${T.glassHighlight}, 0 4px 16px rgba(0,0,0,0.25)`,
      backgroundImage: 'linear-gradient(160deg, rgba(255,255,255,0.04), rgba(255,255,255,0) 60%)',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── SVG icon set for the dock ─────────────────────────────────
const Icons = {
  grid: (color) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill={color} />
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill={color} opacity="0.55" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill={color} opacity="0.55" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill={color} opacity="0.55" />
    </svg>
  ),
  sparkles: (color) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" fill={color} />
      <path d="M19 14L19.8 16.5L22 17.3L19.8 18.1L19 20.5L18.2 18.1L16 17.3L18.2 16.5L19 14Z" fill={color} opacity="0.6" />
    </svg>
  ),
  calendar: (color) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke={color} strokeWidth="2" fill="none" />
      <path d="M3 9.5H21" stroke={color} strokeWidth="2" />
      <path d="M8 3V6.5M16 3V6.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1.4" fill={color} />
      <circle cx="13" cy="14" r="1.4" fill={color} opacity="0.5" />
    </svg>
  ),
  pen: (color) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M4 20L4.8 16.2L16 5L19 8L7.8 19.2L4 20Z" fill={color} />
      <path d="M14 7L17 10" stroke="#000" strokeOpacity="0.2" strokeWidth="1.5" />
    </svg>
  ),
  chart: (color) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="13" width="4" height="8" rx="1" fill={color} opacity="0.55" />
      <rect x="10" y="8" width="4" height="13" rx="1" fill={color} />
      <rect x="16" y="3" width="4" height="18" rx="1" fill={color} opacity="0.8" />
    </svg>
  ),
}

// ── Mini screen recreations ─────────────────────────────────
const S = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30 }

function DashboardScreen({ onNavigate }) {
  const streakDays = Array.from({ length: 56 }, () => {
    const r = Math.random()
    return r > 0.55 ? 1 : 0
  })

  const categories = [
    { l: 'Work', delta: '+12%', up: true },
    { l: 'Health', delta: '+4%', up: true },
    { l: 'Study', delta: '-8%', up: false },
    { l: 'Personal', delta: '+20%', up: true },
  ]

  const tasks = [
    { l: 'Deep work session', tag: 'Work', time: '2h 15m', c: '#4a90d9' },
    { l: 'Morning gym', tag: 'Health', time: '45m', c: '#ff4d00' },
    { l: 'Read 20 pages', tag: 'Study', time: '20m', c: '#5aad7a' },
    { l: 'Plan tomorrow', tag: 'Personal', time: '10m', c: '#8b6bc7' },
  ]

  return (
    <div style={{ height: '100%', position: 'relative', backgroundColor: '#0a0a0a' }}>
      <div style={{
        padding: '20px 18px 16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: S.sm }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff4d00, #c9390a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: 700, color: 'white', fontFamily: 'Bricolage Grotesque, sans-serif',
            }}>
              A
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: T.textPrimary, fontFamily: 'Inter, sans-serif' }}>Avantika</div>
              <div style={{ fontSize: '11px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>Sat, June 20</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: S.xs }}>
            {['bell', 'search'].map(icon => (
              <div key={icon} style={{
                width: '34px', height: '34px', borderRadius: '10px',
                backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${T.glassBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {icon === 'bell' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2C9.5 2 7.5 4 7.5 6.5V11L5.5 15H18.5L16.5 11V6.5C16.5 4 14.5 2 12 2Z" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinejoin="round"/><path d="M9.5 18.5C9.5 19.9 10.6 21 12 21C13.4 21 14.5 19.9 14.5 18.5" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="rgba(255,255,255,0.6)" strokeWidth="2"/><path d="M20 20L16.5 16.5" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round"/></svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stat triplet */}
        <section style={{ marginTop: '20px', flexShrink: 0 }}>
          <GlassCard style={{ padding: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: S.sm }}>
              {[
                { l: 'Today', v: '70%', d: '+5%', up: true },
                { l: 'Week', v: '64%', d: '-2%', up: false },
                { l: 'Streak', v: '12d', d: '+1', up: true },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '11px', color: T.textTertiary, fontFamily: 'Inter, sans-serif' }}>{s.l}</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: T.textPrimary, fontFamily: 'Bricolage Grotesque, sans-serif', letterSpacing: '-0.01em' }}>{s.v}</div>
                  <div style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color: s.up ? '#5aad7a' : '#e25c4a' }}>
                    {s.up ? '↑' : '↓'} {s.d}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* Heatmap */}
        <section style={{ marginTop: '20px', flexShrink: 0 }}>
          <GlassCard style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: S.md }}>
              <span style={{ fontSize: '13px', color: T.textSecondary, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Activity heatmap</span>
              <span style={{ fontSize: '11px', color: T.textTertiary, fontFamily: 'Inter, sans-serif' }}>8 weeks</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gridAutoFlow: 'column', gap: '5px' }}>
              {streakDays.map((on, i) => (
                <div key={i} style={{
                  width: '12px', height: '12px', borderRadius: '3px',
                  backgroundColor: on ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.06)',
                }} />
              ))}
            </div>
          </GlassCard>
        </section>

        {/* Category pills 2x2 */}
        <section style={{ marginTop: '20px', flexShrink: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {categories.map((c, i) => (
              <GlassCard key={i} style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: T.textPrimary, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{c.l}</span>
                <span style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color: c.up ? '#5aad7a' : '#e25c4a' }}>{c.delta}</span>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Tasks — fills remaining space */}
        <section style={{
          marginTop: '24px',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: S.md, flexShrink: 0 }}>
            <span style={{ fontSize: '13px', color: T.textSecondary, fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Tasks</span>
            <span style={{ fontSize: '11px', color: T.textTertiary, fontFamily: 'Inter, sans-serif' }}>Sort by time ↓</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '24px' }}>
            {tasks.map((task, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: S.md,
                padding: '14px 0',
                borderBottom: i < tasks.length - 1 ? `1px solid ${T.glassBorder}` : 'none',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: `${task.c}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: task.c }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: T.textPrimary, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.l}</div>
                  <div style={{ fontSize: '10px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>{task.tag}</div>
                </div>
                <span style={{ fontSize: '11px', color: T.textSecondary, fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>{task.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <PhoneDock activeKey="dashboard" onSelect={onNavigate} />
    </div>
  )
}

function CalendarScreen({ onNavigate }) {
  const monthColors = ['#4a6fd4','#8b2252','#6b7c2e','#c0392b','#c9944a','#ff4d00','#666','#8b4fb5','#1a3a8f']
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <div style={{ padding: '20px 16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: T.s4 }}>
        <div>
          <div style={{ fontSize: '9px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', marginBottom: T.s1 }}>Archive</div>
          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '26px', fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em' }}>
            Calendar
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: T.s2 }}>
          {monthColors.map((c, i) => (
            <GlassCard key={i} style={{ overflow: 'hidden', padding: 0 }}>
              <div style={{ backgroundColor: c, padding: '5px 6px', fontSize: '7px', color: 'white', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700 }}>
                {['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP'][i]}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', padding: '4px' }}>
                {Array.from({ length: 15 }, (_, j) => (
                  <div key={j} style={{
                    aspectRatio: '1', borderRadius: '1px',
                    backgroundColor: Math.random() > 0.5 ? `${c}88` : 'rgba(255,255,255,0.04)',
                  }} />
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
      <PhoneDock activeKey="calendar" onSelect={onNavigate} />
    </div>
  )
}

function JournalScreen({ onNavigate }) {
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <div style={{ padding: '20px 16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: T.s4 }}>
        <div>
          <div style={{ fontSize: '9px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', marginBottom: T.s1 }}>Saturday, June 20</div>
          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '26px', fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em' }}>
            Journal
          </div>
        </div>

        <div style={{ display: 'flex', gap: T.s2, flexWrap: 'wrap' }}>
          {[{ l: 'Great', c: '#ff4d00', a: true }, { l: 'Good', c: '#5aad7a' }, { l: 'Okay', c: '#4a90d9' }].map((m, i) => (
            <div key={i} style={{
              fontSize: '8px', padding: '6px 12px', borderRadius: '100px',
              color: m.a ? m.c : T.textSecondary,
              backgroundColor: m.a ? `${m.c}22` : 'transparent',
              border: `1px solid ${m.a ? m.c + '55' : T.glassBorder}`,
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
            }}>{m.l}</div>
          ))}
        </div>

        <GlassCard style={{ padding: T.s3 }}>
          <p style={{ fontSize: '9px', color: T.textSecondary, fontFamily: 'Inter, sans-serif', lineHeight: 1.7, margin: 0 }}>
            Today I worked through gym, deep work session, and evening reading. Felt productive and focused throughout most of the day...
          </p>
        </GlassCard>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {Array.from({ length: 21 }, (_, i) => (
            <div key={i} style={{
              aspectRatio: '1', borderRadius: '4px',
              backgroundColor: [1,4,6,9,12,15,18].includes(i) ? 'rgba(255,77,0,0.35)' : T.glassBg,
              border: `1px solid ${[1,4,6,9,12,15,18].includes(i) ? 'rgba(255,77,0,0.3)' : T.glassBorder}`,
            }} />
          ))}
        </div>
      </div>
      <PhoneDock activeKey="journal" onSelect={onNavigate} />
    </div>
  )
}

function AnalyticsScreen({ onNavigate }) {
  const bars = [40, 65, 30, 80, 55, 90, 70]
  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <div style={{ padding: '20px 16px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: T.s4 }}>
        <div>
          <div style={{ fontSize: '9px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', marginBottom: T.s1 }}>Insights</div>
          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '26px', fontWeight: 700, color: T.textPrimary, letterSpacing: '-0.02em' }}>
            Analytics
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: T.s2 }}>
          {[{ l: 'Avg Completion', v: '78%', c: '#ff4d00' }, { l: 'Focus Time', v: '5h 20m', c: '#4a90d9' }].map((s, i) => (
            <GlassCard key={i} style={{ padding: T.s3 }}>
              <div style={{ fontSize: '7px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: T.s1 }}>{s.l}</div>
              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '17px', fontWeight: 700, color: s.c }}>{s.v}</div>
            </GlassCard>
          ))}
        </div>

        <GlassCard style={{ padding: T.s3 }}>
          <div style={{ fontSize: '8px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: T.s3 }}>
            Focus hours
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: T.s2, height: '64px' }}>
            {bars.map((h, i) => (
              <div key={i} style={{
                flex: 1, height: `${h}%`, borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(180deg, #ff4d00, #c9390a)',
              }} />
            ))}
          </div>
        </GlassCard>
      </div>
      <PhoneDock activeKey="analytics" onSelect={onNavigate} />
    </div>
  )
}

function SplashScreen() {
  const words = ['built', 'for', 'the', 'consistent.']
  const [visibleCount, setVisibleCount] = useState(0)
  const [focusMode, setFocusMode] = useState(false)

  useEffect(() => {
    const timers = []
    words.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleCount(i + 1), i * 450))
    })
    timers.push(setTimeout(() => setFocusMode(true), words.length * 450 + 900))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div style={{
      height: '100%',
      background: '#050505',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      padding: '0 16px',
    }}>
      <div style={{
        position: 'relative',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        fontWeight: 700,
        fontSize: 'clamp(20px, 7vw, 26px)',
        lineHeight: 1.15,
        letterSpacing: '-0.03em',
        textAlign: 'center',
      }}>
        {!focusMode ? (
          <>
            {words.map((word, i) => {
              const shown = visibleCount > i
              return (
                <span
                  key={word}
                  style={{
                    display: 'inline-block',
                    marginRight: i !== words.length - 1 ? 8 : 0,
                    opacity: shown ? 1 : 0,
                    transform: shown ? 'translateY(0px)' : 'translateY(14px)',
                    transition: 'opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)',
                    color: i === words.length - 1 ? '#ff5a1f' : '#F4F4F4',
                  }}
                >
                  {word}
                  {i === 2 && <br />}
                </span>
              )
            })}
          </>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            <span style={{
              color: '#777',
              fontSize: 'clamp(22px, 7vw, 48px)',
              animation: 'slideIn .8s cubic-bezier(.16,1,.3,1) forwards',
            }}>
              be
            </span>
            <span style={{
              color: '#ff5a1f',
              fontWeight: 800,
              fontSize: 'clamp(22px, 7vw, 48px)',
              animation: 'heroReveal 1s cubic-bezier(.16,1,.3,1) forwards',
            }}>
              consistent.
            </span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); filter: blur(6px); }
          to { opacity: 1; transform: translateX(0); filter: blur(0); }
        }
        @keyframes heroReveal {
          0% { opacity: 0; transform: translateY(14px) scale(.94); letter-spacing: -0.08em; filter: blur(8px); }
          60% { opacity: 1; transform: translateY(0) scale(1.03); }
          100% { opacity: 1; transform: translateY(0) scale(1); letter-spacing: -0.03em; filter: blur(0); }
        }
      `}</style>
    </div>
  )
}

const DOCK_ITEMS = [
  { key: 'dashboard', label: 'Home', icon: 'grid', color: '#ff4d00' },
  { key: 'planner', label: 'Plan', icon: 'sparkles', color: '#4a90d9' },
  { key: 'calendar', label: 'Cal', icon: 'calendar', color: '#8b6bc7' },
  { key: 'journal', label: 'Journal', icon: 'pen', color: '#5aad7a' },
  { key: 'analytics', label: 'Stats', icon: 'chart', color: '#c9944a' },
]

function PhoneDock({ activeKey, onSelect }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      padding: '10px 8px 16px',
      backgroundColor: 'rgba(8,8,8,0.92)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
    }}>
      {DOCK_ITEMS.map(item => {
        const active = item.key === activeKey
        const iconColor = active ? '#ff4d00' : 'rgba(255,255,255,0.4)'
        return (
          <button
            key={item.key}
            onClick={() => onSelect && onSelect(item.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              background: 'none', border: 'none', padding: '4px', cursor: 'pointer',
            }}
          >
            {Icons[item.icon](iconColor)}
            <div style={{
              width: '3px', height: '3px', borderRadius: '50%',
              backgroundColor: active ? '#ff4d00' : 'transparent',
            }} />
          </button>
        )
      })}
    </div>
  )
}

const SCREENS = [
  { name: 'Splash', Component: SplashScreen, side: null },
  {
    name: 'Dashboard', Component: DashboardScreen, side: 'left',
    title: 'Your day, at a glance',
    desc: 'See your schedule, tasks, and activity rings the moment you open the app. Everything you need to know about today, in one screen.',
  },
  {
    name: 'Calendar', Component: CalendarScreen, side: 'right',
    title: 'Build your streak',
    desc: 'A full year of your consistency, color-coded by month. Watch your habits compound, one square at a time.',
  },
  {
    name: 'Journal', Component: JournalScreen, side: 'left',
    title: 'Reflect, daily',
    desc: 'Track your mood and write about your day — with AI drafts pulled from what you actually did, so reflection never feels like a chore.',
  },
  {
    name: 'Analytics', Component: AnalyticsScreen, side: 'right',
    title: 'Know your patterns',
    desc: 'Real trends from your real data — completion rates, focus hours, and mood correlation, all in one view.',
  },
]

const KEY_MAP = { dashboard: 'Dashboard', calendar: 'Calendar', journal: 'Journal', analytics: 'Analytics' }

export default function Showcase() {
  const scrollContainerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    let raf = null
    const handleScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = null
        const el = scrollContainerRef.current
        if (!el) return

        const rect = el.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        const scrolled = -rect.top
        const progress = Math.min(1, Math.max(0, scrolled / total))

        const index = Math.min(SCREENS.length - 1, Math.floor(progress * SCREENS.length))
        setActiveIndex(prev => (prev === index ? prev : index))
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const { Component } = SCREENS[activeIndex]

  const handleDockNavigate = (key) => {
    const targetName = KEY_MAP[key]
    if (!targetName) return
    const targetIndex = SCREENS.findIndex(s => s.name === targetName)
    if (targetIndex === -1) return

    const el = scrollContainerRef.current
    if (!el) return
    const total = el.getBoundingClientRect().height - window.innerHeight
    const targetProgress = (targetIndex + 0.5) / SCREENS.length
    const targetScroll = window.scrollY + el.getBoundingClientRect().top + targetProgress * total
    window.scrollTo({ top: targetScroll, behavior: 'smooth' })
  }

  return (
    <div style={{ backgroundColor: '#000' }}>

      {/* Nav — fixed on top */}
      <div style={{
        position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: 'calc(100% - 48px)', maxWidth: '1100px',
        padding: '16px 22px',
        borderRadius: '52px',
        backgroundColor: 'rgba(10,10,10,0.7)',
        backdropFilter: 'blur(36px)',
        boxShadow: 'rgba(0,0,0,0.06) 0px 8px 30px 0px',
        border: '1px solid rgba(255,255,255,0.06)',
        zIndex: 100,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <InfinityIcon size={22} color="#ff4d00" strokeWidth={2.5} />
          <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '16px', color: '#f0f0f0' }}>SYNQ</span>
        </Link>
        <Link
          to="/login"
          style={{
            padding: '10px 22px', borderRadius: '30px',
            backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
            color: '#f0f0f0', fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          Log in →
        </Link>
      </div>

      {/* Scroll-controlled phone section */}
      <div ref={scrollContainerRef} style={{ position: 'relative', height: '400vh' }}>
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
            width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,77,0,0.16) 0%, transparent 70%)',
            filter: 'blur(70px)', zIndex: 0,
          }} />

          {/* Outer row: left text | phone | right text */}
          <div style={{
            position: 'relative', zIndex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '64px', width: '100%', maxWidth: '1200px', padding: '0 48px',
          }}>

            {/* Left text slot */}
            <div style={{ flex: 1, textAlign: 'right' }}>
              {SCREENS.map((s, i) => {
                if (s.side !== 'left') return null
                const active = i === activeIndex
                return (
                  <div
                    key={s.name}
                    style={{
                      position: active ? 'static' : 'absolute',
                      opacity: active ? 1 : 0,
                      transform: active ? 'translateX(0)' : 'translateX(-20px)',
                      transition: 'opacity 0.6s ease, transform 0.6s ease',
                      pointerEvents: active ? 'auto' : 'none',
                    }}
                  >
                    <h3 style={{
                      fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '48px', fontWeight: 600,
                      color: '#f0f0f0', letterSpacing: '-0.02em', marginBottom: '12px',
                    }}>
                      {s.title}
                    </h3>
                    <p style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '18px', color: 'rgba(255,255,255,0.45)',
                      lineHeight: 1.6, maxWidth: '280px', marginLeft: 'auto',
                    }}>
                      {s.desc}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Phone */}
            <div style={{
              filter: 'drop-shadow(rgba(0,0,0,0.5) 0px 30px 90px)',
              flexShrink: 0,
            }}>
              <Iphone width={370}>
                <Component onNavigate={handleDockNavigate} />
              </Iphone>
            </div>

            {/* Right text slot */}
            <div style={{ flex: 1, textAlign: 'left' }}>
              {SCREENS.map((s, i) => {
                if (s.side !== 'right') return null
                const active = i === activeIndex
                return (
                  <div
                    key={s.name}
                    style={{
                      position: active ? 'static' : 'absolute',
                      opacity: active ? 1 : 0,
                      transform: active ? 'translateX(0)' : 'translateX(20px)',
                      transition: 'opacity 0.6s ease, transform 0.6s ease',
                      pointerEvents: active ? 'auto' : 'none',
                    }}
                  >
                    <h3 style={{
                      fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '48px', fontWeight: 600,
                      color: '#f0f0f0', letterSpacing: '-0.02em', marginBottom: '12px',
                    }}>
                      {s.title}
                    </h3>
                    <p style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '18px', color: 'rgba(255,255,255,0.45)',
                      lineHeight: 1.6, maxWidth: '280px',
                    }}>
                      {s.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
    </div>
  )
}