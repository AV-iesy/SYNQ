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
const hiddenPhoneScroll = { scrollbarWidth: 'none', msOverflowStyle: 'none' }
const dashboardStreakDays = Array.from({ length: 56 }, (_, i) => {
  const seed = (i * 17 + 11) % 23
  return seed > 10 ? 1 : 0
})

function DashboardScreen({ onNavigate }) {
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
              <div style={{ fontSize: '14px', fontWeight: 600, color: T.textPrimary, fontFamily: 'Inter, sans-serif' }}>AV</div>
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
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '28px' }}>
              {[
                { l: 'Today', v: '70%', d: '+5%', up: true },
                { l: 'Week', v: '64%', d: '-2%', up: false },
                { l: 'Streak', v: '12d', d: '+1', up: true },
              ].map((s, i) => (
                // <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
  key={i}
  style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '100px',
    alignItems: 'flex-start'
  }}
>
                  <div style={{ fontSize: '15px',
fontWeight: 500,
color: T.textSecondary,
marginBottom: '6px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', alignItems: 'flex-start' }}>{s.l}</div>
                  <div style={{ fontSize: '36px',
fontWeight: 700,
lineHeight: 1,
letterSpacing: '-0.03em', fontWeight: 700, color: T.textPrimary, fontFamily: 'Bricolage Grotesque, sans-serif', letterSpacing: '-0.01em' }}>{s.v}</div>
                  <div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: s.up ? '#56c58c' : '#ff6a55',
    alignItems: 'flex-start'
  }}
>
    <span>{s.up ? '↑' : '↓'}</span>
    <span>{s.d}</span>
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
              <span style={{ fontSize: '11px', color: T.textTertiary, fontFamily: 'Inter, sans-serif' }}>4 weeks</span>
            </div>
            
            <div
  style={{
    display: 'flex',
    gap: '2px',
    flexWrap: 'nowrap',
    overflow: 'hidden',
  }}
>
  {dashboardStreakDays.map((on, i) => (
    <div
      key={i}
      style={{
        width: '12px',
        height: '12px',
        flexShrink: 0,
        borderRadius: '3px',
        backgroundColor: on
          ? 'rgba(255,255,255,0.85)'
          : 'rgba(255,255,255,0.06)',
      }}
    />
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
          <div className="phone-scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: '24px', ...hiddenPhoneScroll }}>
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

function PlannerScreen({ onNavigate }) {
  const schedule = [
    { time: '6:30', end: '7:15', label: 'Wake, hydrate, reset room', tag: 'Start', c: '#c9944a' },
    { time: '7:15', end: '8:15', label: 'Gym: push workout', tag: 'Health', c: '#ff4d00' },
    { time: '9:00', end: '12:00', label: 'Deep work on React project', tag: 'Work', c: '#4a90d9' },
    { time: '12:30', end: '1:15', label: 'Lunch and short walk', tag: 'Break', c: '#5aad7a' },
    { time: '2:00', end: '4:00', label: 'DSA study sprint', tag: 'Study', c: '#8b6bc7' },
    { time: '8:45', end: '10:30', label: 'Plan tomorrow, wind down', tag: 'Close', c: '#c9944a' },
  ]

  const chips = ['Gym 7am', 'Office 9-5', 'Study DSA', 'Sleep 11pm']

  return (
    <div style={{
      height: '100%',
      position: 'relative',
      background: 'linear-gradient(180deg, #101010 0%, #050505 74%)',
    }}>
      <div style={{
        padding: '18px 16px 0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ flexShrink: 0, marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: 600,
                color: T.textTertiary,
                fontFamily: 'Inter, sans-serif',
                textTransform: 'uppercase',
                marginBottom: '5px',
              }}>
                AI day architect
              </div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: '28px',
                fontWeight: 800,
                lineHeight: 1,
                color: T.textPrimary,
              }}>
                Planner
              </div>
            </div>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '11px',
              backgroundColor: 'rgba(74,144,217,0.13)',
              border: '1px solid rgba(74,144,217,0.32)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 22px rgba(74,144,217,0.16)',
            }}>
              {Icons.sparkles('#7fbcff')}
            </div>
          </div>
        </div>

        {/* Prompt composer */}
        <section style={{ flexShrink: 0, marginBottom: '10px' }}>
          <GlassCard style={{
            padding: '13px',
            background:
              'linear-gradient(160deg, rgba(74,144,217,0.13), rgba(255,255,255,0.04) 48%, rgba(255,77,0,0.06))',
            border: '1px solid rgba(255,255,255,0.11)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '8px',
                backgroundColor: '#4a90d9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {Icons.sparkles('white')}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: T.textPrimary, fontFamily: 'Inter, sans-serif' }}>
                  Tell SYNQ your day
                </div>
                <div style={{ fontSize: '9px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                  It turns messy intent into a real schedule.
                </div>
              </div>
            </div>
            <div style={{
              borderRadius: '12px',
              backgroundColor: 'rgba(0,0,0,0.28)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '11px 12px',
              minHeight: '64px',
              color: T.textSecondary,
              fontSize: '11px',
              lineHeight: 1.55,
              fontFamily: 'Inter, sans-serif',
            }}>
              Gym in the morning, office from 9 to 5, finish React work, study DSA for 2 hours, and sleep before 11.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {chips.map(chip => (
                <div key={chip} style={{
                  padding: '4px 7px',
                  borderRadius: '100px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: T.textSecondary,
                  fontSize: '9px',
                  fontFamily: 'Inter, sans-serif',
                  whiteSpace: 'nowrap',
                }}>
                  {chip}
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* AI response */}
        <section style={{ flexShrink: 0, marginBottom: '10px' }}>
          <GlassCard style={{ padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '10px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>
                Generated plan
              </span>
              <span style={{
                padding: '4px 7px',
                borderRadius: '100px',
                backgroundColor: 'rgba(90,173,122,0.12)',
                border: '1px solid rgba(90,173,122,0.24)',
                color: '#5aad7a',
                fontSize: '9px',
                fontWeight: 700,
                fontFamily: 'Inter, sans-serif',
              }}>
                Balanced
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '7px',
            }}>
              {[
                { l: 'Focus', v: '5h', c: '#4a90d9' },
                { l: 'Breaks', v: '6', c: '#5aad7a' },
                { l: 'Sleep', v: '7.5h', c: '#8b6bc7' },
              ].map(item => (
                <div key={item.l} style={{
                  borderRadius: '10px',
                  backgroundColor: `${item.c}14`,
                  border: `1px solid ${item.c}30`,
                  padding: '9px 8px',
                }}>
                  <div style={{ fontSize: '8px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', marginBottom: '5px' }}>
                    {item.l}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: item.c, fontFamily: 'Bricolage Grotesque, sans-serif', lineHeight: 1 }}>
                    {item.v}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* Timeline */}
        <section style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            fontSize: '11px',
            color: T.textTertiary,
            fontFamily: 'Inter, sans-serif',
            textTransform: 'uppercase',
            marginBottom: '8px',
            flexShrink: 0,
          }}>
            Today timeline
          </div>
          <div className="phone-scroll" style={{
            flex: 1,
            overflowY: 'auto',
            paddingBottom: '74px',
            display: 'flex',
            flexDirection: 'column',
            gap: '7px',
            ...hiddenPhoneScroll,
          }}>
            {schedule.map((block, i) => (
              <GlassCard key={`${block.time}-${block.label}`} style={{
                padding: '9px 10px',
                display: 'grid',
                gridTemplateColumns: '42px 1fr',
                gap: '9px',
                alignItems: 'center',
                position: 'relative',
              }}>
                {i < schedule.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '31px',
                    top: '38px',
                    bottom: '-10px',
                    width: '1px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                  }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: block.c,
                    boxShadow: `0 0 10px ${block.c}55`,
                    flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: '10px', color: T.textPrimary, fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                      {block.time}
                    </div>
                    <div style={{ fontSize: '8px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', marginTop: '2px' }}>
                      {block.end}
                    </div>
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '11px',
                    color: T.textPrimary,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '4px',
                  }}>
                    {block.label}
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    padding: '3px 6px',
                    borderRadius: '100px',
                    backgroundColor: `${block.c}16`,
                    border: `1px solid ${block.c}30`,
                    color: block.c,
                    fontSize: '8px',
                    fontWeight: 700,
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {block.tag}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

      </div>
      <PhoneDock activeKey="planner" onSelect={onNavigate} />
    </div>
  )
}

function CalendarScreen({ onNavigate }) {
  const monthColors = [
    '#4a6fd4','#7b3fa8','#2e8b57','#c0392b',
    '#c9944a','#ff4d00','#4a8fa8','#8b4fb5','#1a5a8f',
    '#6b8e23','#8b2252','#2e5b8f',
  ]
  const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

  // Seeded activity data — consistent, not random on every render
  const monthActivity = monthColors.map((_, mi) =>
    Array.from({ length: 28 }, (_, di) => {
      const seed = (mi * 31 + di * 7) % 17
      return seed > 8 ? (seed > 13 ? 2 : 1) : 0
    })
  )

  const currentMonth = 5 // June (0-indexed)
  const currentMonthDays = monthActivity[currentMonth]
  const activeDays = currentMonthDays.filter(d => d > 0).length
  const totalStreak = 12
  const bestStreak = 18
  const yearDone = monthActivity.flat().filter(d => d > 0).length
  const yearTotal = monthActivity.flat().length

  return (
    <div style={{ height: '100%', position: 'relative', backgroundColor: '#0a0a0a' }}>
      <div style={{
        padding: '20px 18px 0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ flexShrink: 0, marginBottom: '20px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em',
            color: T.textTertiary, fontFamily: 'Inter, sans-serif',
            textTransform: 'uppercase', marginBottom: '6px',
          }}>
            Archive
          </div>
          <div style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: '28px', fontWeight: 700, lineHeight: 1,
            letterSpacing: '-0.03em', color: T.textPrimary,
          }}>
            Calendar
          </div>
        </div>

        {/* Streak hero card */}
        <section style={{ flexShrink: 0, marginBottom: '16px' }}>
          <GlassCard style={{ padding: '24px 24px 22px', position: 'relative', overflow: 'hidden' }}>
            {/* Subtle glow behind streak number */}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '14px',fontWeight: 500,color: 'rgba(255,255,255,0.58)',letterSpacing: '0.01em', fontFamily: 'Inter, sans-serif' }}>Streak</div>
                <div style={{ fontSize: '46px', fontWeight: 700,lineHeight: 1,letterSpacing: '-0.05em', color: '#ff4d00', fontFamily: 'Bricolage Grotesque, sans-serif', letterSpacing: '-0.02em' }}>{totalStreak}d</div>
                <div style={{ fontSize: '10px', color: '#5aad7a', fontFamily: 'Inter, sans-serif' }}>↑ active</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 500,color: 'rgba(255,255,255,0.58)',letterSpacing: '0.01em', fontFamily: 'Inter, sans-serif' }}>Best</div>
                <div style={{ fontSize: '46px', fontWeight: 700,lineHeight: 1,letterSpacing: '-0.05em', color: T.textPrimary, fontFamily: 'Bricolage Grotesque, sans-serif', letterSpacing: '-0.02em' }}>{bestStreak}d</div>
                <div style={{ fontSize: '10px', color: T.textTertiary, fontFamily: 'Inter, sans-serif' }}>all time</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.58)',letterSpacing: '0.01em', fontFamily: 'Inter, sans-serif' }}>Year</div>
                <div style={{ fontSize: '46px', fontWeight: 700, lineHeight: 1,letterSpacing: '-0.05em', color: T.textPrimary, fontFamily: 'Bricolage Grotesque, sans-serif', letterSpacing: '-0.02em' }}>{yearDone}</div>
                <div style={{ fontSize: '10px', color: T.textTertiary, fontFamily: 'Inter, sans-serif' }}>of {yearTotal} days</div>
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Current month focus */}
        <section style={{ flexShrink: 0, marginBottom: '16px' }}>
          <GlassCard style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: monthColors[currentMonth],
                }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: T.textPrimary, fontFamily: 'Inter, sans-serif' }}>
                  {monthNames[currentMonth]} 2026
                </span>
              </div>
              <span style={{ fontSize: '11px', color: T.textTertiary, fontFamily: 'Inter, sans-serif' }}>
                {activeDays} active days
              </span>
            </div>
            {/* Full month grid — 7 cols x 4 rows */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} style={{ fontSize: '7px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', textAlign: 'center', paddingBottom: '3px' }}>{d}</div>
              ))}
              {Array.from({ length: 2 }, (_, i) => (
                <div key={`empty-${i}`} style={{ aspectRatio: '1' }} />
              ))}
              {Array.from({ length: 30 }, (_, i) => {
                const level = monthActivity[currentMonth][i] || 0
                const isToday = i === 19
                return (
                  <div key={i} style={{
                    aspectRatio: '1', borderRadius: '3px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isToday
                      ? '#ff4d00'
                      : level === 2
                        ? `${monthColors[currentMonth]}cc`
                        : level === 1
                          ? `${monthColors[currentMonth]}55`
                          : 'rgba(255,255,255,0.05)',
                    border: isToday ? 'none' : `1px solid rgba(255,255,255,0.04)`,
                  }}>
                    <span style={{ fontSize: '6px', color: isToday ? 'white' : T.textTertiary, fontFamily: 'Inter, sans-serif' }}>{i + 1}</span>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </section>

        {/* Year overview — compact 3-col month grid */}
        <section style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div style={{ fontSize: '11px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', flexShrink: 0 }}>
            Year overview
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {monthColors.map((c, mi) => {
              const act = monthActivity[mi].filter(d => d > 0).length
              const isCurrent = mi === currentMonth
              return (
                <GlassCard key={mi} style={{
                  overflow: 'hidden', padding: 0,
                  border: isCurrent ? `1px solid ${c}88` : `1px solid ${T.glassBorder}`,
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '5px 7px',
                    backgroundColor: isCurrent ? `${c}33` : 'rgba(255,255,255,0.03)',
                    borderBottom: `1px solid rgba(255,255,255,0.04)`,
                  }}>
                    <span style={{ fontSize: '7px', fontWeight: 700, color: isCurrent ? c : T.textTertiary, fontFamily: 'Inter, sans-serif' }}>
                      {monthNames[mi]}
                    </span>
                    <span style={{ fontSize: '6px', color: T.textTertiary, fontFamily: 'Inter, sans-serif' }}>{act}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1.5px', padding: '5px' }}>
                    {monthActivity[mi].map((level, di) => (
                      <div key={di} style={{
                        aspectRatio: '1', borderRadius: '1px',
                        backgroundColor: level === 2 ? `${c}cc` : level === 1 ? `${c}55` : 'rgba(255,255,255,0.05)',
                      }} />
                    ))}
                  </div>
                </GlassCard>
              )
            })}
          </div>
        </section>

      </div>
      <PhoneDock activeKey="calendar" onSelect={onNavigate} />
    </div>
  )
}


function JournalScreen({ onNavigate }) {
  const moods = [
    { l: 'Great', c: '#ff4d00', emoji: '●' },
    { l: 'Good', c: '#5aad7a', emoji: '●' },
    { l: 'Okay', c: '#4a90d9', emoji: '●' },
    { l: 'Low', c: '#8b6bc7', emoji: '●' },
    { l: 'Rough', c: '#888', emoji: '●' },
  ]
  const activeMood = moods[0]

  const recentMoods = [
    { d: 'Mon', m: moods[1] },
    { d: 'Tue', m: moods[0] },
    { d: 'Wed', m: moods[2] },
    { d: 'Thu', m: moods[0] },
    { d: 'Fri', m: moods[1] },
    { d: 'Sat', m: moods[0], today: true },
  ]

  const pastEntries = [
    { date: 'Jun 19', mood: moods[1], preview: 'Finished the React project and had a solid...' },
    { date: 'Jun 18', mood: moods[2], preview: 'Slow start but picked up pace in the evening.' },
    { date: 'Jun 17', mood: moods[0], preview: 'Best workout week this month. Energy was...' },
  ]

  return (
    <div style={{ height: '100%', position: 'relative', backgroundColor: '#0a0a0a' }}>
      <div style={{
        padding: '20px 18px 0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ flexShrink: 0, marginBottom: '20px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em',
            color: T.textTertiary, fontFamily: 'Inter, sans-serif',
            textTransform: 'uppercase', marginBottom: '6px',
          }}>
            Saturday, June 20
          </div>
          <div style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: '28px', fontWeight: 700, lineHeight: 1,
            letterSpacing: '-0.03em', color: T.textPrimary,
          }}>
            Journal
          </div>
        </div>

        {/* Mood hero — dominant card */}
        <section style={{ flexShrink: 0, marginBottom: '14px' }}>
          <GlassCard style={{
            padding: '16px',
            position: 'relative', overflow: 'hidden',
            background: `linear-gradient(135deg, ${activeMood.c}18, rgba(255,255,255,0.03))`,
            border: `1px solid ${activeMood.c}33`,
          }}>
            

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '10px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>
                  Today's mood
                </div>
                <div style={{
                  fontSize: '22px', fontWeight: 700, color: activeMood.c,
                  fontFamily: 'Bricolage Grotesque, sans-serif', letterSpacing: '-0.02em',
                }}>
                  {activeMood.l}
                </div>
                <div style={{ fontSize: '10px', color: T.textSecondary, fontFamily: 'Inter, sans-serif', marginTop: '4px' }}>
                  You've felt great 4 of last 7 days
                </div>
              </div>
              {/* Mood selector pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                {moods.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '3px 8px', borderRadius: '100px',
                    backgroundColor: m.l === activeMood.l ? `${m.c}22` : 'transparent',
                    border: `1px solid ${m.l === activeMood.l ? m.c + '55' : 'rgba(255,255,255,0.06)'}`,
                    cursor: 'pointer',
                  }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: m.c }} />
                    <span style={{
                      fontSize: '8px', fontFamily: 'Inter, sans-serif', fontWeight: 500,
                      color: m.l === activeMood.l ? m.c : T.textTertiary,
                    }}>
                      {m.l}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood timeline */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '14px' }}>
              {recentMoods.map((rm, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '100%', height: '24px', borderRadius: '4px',
                    backgroundColor: rm.today ? rm.m.c : `${rm.m.c}55`,
                    border: rm.today ? `1px solid ${rm.m.c}` : 'none',
                  }} />
                  <span style={{ fontSize: '7px', color: rm.today ? T.textPrimary : T.textTertiary, fontFamily: 'Inter, sans-serif' }}>
                    {rm.d}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* Today's entry */}
        <section style={{ flexShrink: 0, marginBottom: '14px' }}>
          <GlassCard style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: T.textSecondary, fontFamily: 'Inter, sans-serif' }}>
                Today's entry
              </span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '3px 8px', borderRadius: '100px',
                backgroundColor: 'rgba(255,77,0,0.1)', border: '1px solid rgba(255,77,0,0.2)',
              }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3L14 9H20L15 13L17 19L12 15L7 19L9 13L4 9H10L12 3Z" fill="#ff4d00" />
                </svg>
                <span style={{ fontSize: '8px', color: '#ff4d00', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>AI draft</span>
              </div>
            </div>
            <p style={{
              fontSize: '11px', color: T.textSecondary, fontFamily: 'Inter, sans-serif',
              lineHeight: 1.7, margin: 0,
            }}>
              Today I worked through gym, deep work session, and evening reading. Felt productive and focused throughout most of the day...
            </p>
            <div style={{
              marginTop: '10px', paddingTop: '10px',
              borderTop: `1px solid ${T.glassBorder}`,
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '9px', color: T.textTertiary, fontFamily: 'Inter, sans-serif' }}>142 characters</span>
              <span style={{ fontSize: '9px', color: '#ff4d00', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Save entry →</span>
            </div>
          </GlassCard>
        </section>

        {/* Past entries */}
        <section style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            fontSize: '11px', color: T.textTertiary, fontFamily: 'Inter, sans-serif',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', flexShrink: 0,
          }}>
            Recent entries
          </div>
          <div className="phone-scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px', ...hiddenPhoneScroll }}>
            {pastEntries.map((entry, i) => (
              <GlassCard key={i} style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: entry.mood.c, flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', fontWeight: 600, color: T.textPrimary, fontFamily: 'Inter, sans-serif' }}>{entry.date}</span>
                  <span style={{
                    fontSize: '8px', padding: '2px 6px', borderRadius: '100px',
                    color: entry.mood.c, backgroundColor: `${entry.mood.c}18`,
                    border: `1px solid ${entry.mood.c}33`, fontFamily: 'Inter, sans-serif',
                  }}>{entry.mood.l}</span>
                </div>
                <p style={{ fontSize: '9px', color: T.textSecondary, fontFamily: 'Inter, sans-serif', lineHeight: 1.5, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.preview}
                </p>
              </GlassCard>
            ))}
          </div>
        </section>

      </div>
      <PhoneDock activeKey="journal" onSelect={onNavigate} />
    </div>
  )
}


function AnalyticsScreen({ onNavigate }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const completionBars = [55, 72, 45, 88, 63, 91, 78]
  const focusBars = [3.5, 5.2, 2.1, 6.0, 4.4, 5.8, 5.3]
  const maxFocus = Math.max(...focusBars)
  const graphWidth = 260
  const graphHeight = 94
  const points = completionBars.map((value, i) => {
    const x = (i * graphWidth) / (completionBars.length - 1)
    const y = graphHeight - (value / 100) * graphHeight
    return { x, y, value }
  })
  const trendPath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = points[i - 1]
    const cx = (prev.x + p.x) / 2
    return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`
  }, '')
  const trendArea = `${trendPath} L ${graphWidth} ${graphHeight} L 0 ${graphHeight} Z`

  const insights = [
    { icon: '↑', title: 'Best day', text: 'Saturday hit 91% completion', c: '#5aad7a' },
    { icon: '⚡', title: 'Peak focus', text: '6h deep work on Thursday', c: '#ff4d00' },
    { icon: '●', title: 'Mood lift', text: 'Great mood logged 3 times', c: '#4a90d9' },
  ]

  const statCards = [
    { l: 'Completion', v: '78%', d: '+6%', c: '#ff4d00' },
    { l: 'Focus', v: '5h 20m', d: '+45m', c: '#4a90d9' },
    { l: 'Done', v: '47/60', d: '+8', c: '#5aad7a' },
  ]

  const categories = [
    { l: 'Work', v: 44, c: '#4a90d9' },
    { l: 'Health', v: 26, c: '#5aad7a' },
    { l: 'Study', v: 18, c: '#8b6bc7' },
  ]

  return (
    <div style={{
      height: '100%',
      position: 'relative',
      background: 'linear-gradient(180deg, #111111 0%, #050505 72%)',
    }}>
      <div style={{
        padding: '18px 16px 0',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ flexShrink: 0, marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{
                fontSize: '10px', fontWeight: 600,
                color: T.textTertiary, fontFamily: 'Inter, sans-serif',
                textTransform: 'uppercase', marginBottom: '5px',
              }}>
                Insights
              </div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: '28px', fontWeight: 700, lineHeight: 1,
                color: T.textPrimary,
              }}>
                Analytics
              </div>
            </div>
            <div style={{
              display: 'flex', gap: '4px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: `1px solid ${T.glassBorder}`,
              borderRadius: '10px', padding: '3px',
            }}>
              {['7d', '30d', '90d'].map((r, i) => (
                <div key={r} style={{
                  padding: '4px 7px', borderRadius: '7px', fontSize: '9px',
                  fontFamily: 'Inter, sans-serif', fontWeight: 500,
                  backgroundColor: i === 0 ? '#ff4d00' : 'transparent',
                  color: i === 0 ? 'white' : T.textTertiary,
                }}>
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero insight */}
        <section style={{ flexShrink: 0, marginBottom: '10px' }}>
          <GlassCard style={{ padding: '14px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px', position: 'relative' }}>
              <div>
                <div style={{ fontSize: '10px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', marginBottom: '5px' }}>
                  Weekly score
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '44px', lineHeight: 0.9, fontWeight: 800, color: T.textPrimary }}>78</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: T.textTertiary }}>/100</span>
                </div>
              </div>
              <div style={{
                padding: '5px 8px',
                borderRadius: '100px',
                backgroundColor: 'rgba(90,173,122,0.12)',
                border: '1px solid rgba(90,173,122,0.28)',
                color: '#5aad7a',
                fontSize: '10px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
              }}>
                ↑ 6% better
              </div>
            </div>
            <div style={{ position: 'relative', height: '112px' }}>
              <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} preserveAspectRatio="none" style={{ width: '100%', height: '94px', display: 'block' }}>
                <defs>
                  <linearGradient id="analyticsTrendFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,77,0,0.34)" />
                    <stop offset="100%" stopColor="rgba(255,77,0,0)" />
                  </linearGradient>
                  <linearGradient id="analyticsTrendStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4a90d9" />
                    <stop offset="52%" stopColor="#ff4d00" />
                    <stop offset="100%" stopColor="#5aad7a" />
                  </linearGradient>
                </defs>
                {[25, 50, 75].map(y => (
                  <line key={y} x1="0" x2={graphWidth} y1={(graphHeight * y) / 100} y2={(graphHeight * y) / 100} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                ))}
                <path d={trendArea} fill="url(#analyticsTrendFill)" />
                <path d={trendPath} fill="none" stroke="url(#analyticsTrendStroke)" strokeWidth="4" strokeLinecap="round" />
                {points.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={i === 5 ? 5 : 3.3} fill={i === 5 ? '#ff4d00' : '#111'} stroke={i === 5 ? '#ffd3c2' : 'rgba(255,255,255,0.52)'} strokeWidth="2" />
                ))}
              </svg>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginTop: '4px' }}>
                {days.map((day, i) => (
                  <div key={`${day}-${i}`} style={{
                    textAlign: 'center',
                    fontSize: '8px',
                    color: i === 5 ? '#ff4d00' : T.textTertiary,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: i === 5 ? 700 : 500,
                  }}>
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Stat strip */}
        <section style={{ flexShrink: 0, marginBottom: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '7px' }}>
            {statCards.map(s => (
              <GlassCard key={s.l} style={{ padding: '10px' }}>
                <div style={{ fontSize: '8px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', marginBottom: '5px' }}>{s.l}</div>
                <div style={{ fontSize: '17px', fontWeight: 800, color: s.c, fontFamily: 'Bricolage Grotesque, sans-serif', lineHeight: 1 }}>{s.v}</div>
                <div style={{ marginTop: '5px', fontSize: '9px', color: '#5aad7a', fontFamily: 'Inter, sans-serif' }}>↑ {s.d}</div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Focus and breakdown */}
        <section style={{ flexShrink: 0, marginBottom: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: '8px' }}>
            <GlassCard style={{ padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '9px' }}>
                <span style={{ fontSize: '10px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>Focus rhythm</span>
                <span style={{ fontSize: '9px', color: '#4a90d9', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>Thu peak</span>
              </div>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '5px',
                height: '58px',
                paddingTop: '4px',
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '18px',
                  height: '1px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                }} />
                {focusBars.map((h, i) => (
                  <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    <div style={{
                      width: '100%',
                      height: `${(h / maxFocus) * 100}%`,
                      minHeight: '10px',
                      borderRadius: '4px 4px 2px 2px',
                      background: i === 3
                        ? 'linear-gradient(180deg, #9fcbff, #4a90d9)'
                        : 'rgba(74,144,217,0.28)',
                      border: i === 3 ? '1px solid rgba(159,203,255,0.52)' : '1px solid rgba(74,144,217,0.18)',
                      boxShadow: i === 3 ? '0 0 10px rgba(74,144,217,0.24)' : 'none',
                    }} />
                    <span style={{
                      fontSize: '7px',
                      color: i === 3 ? '#9fcbff' : T.textTertiary,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: i === 3 ? 700 : 500,
                    }}>
                      {days[i]}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
                <span style={{ fontSize: '16px', lineHeight: 1, fontWeight: 800, color: '#4a90d9', fontFamily: 'Bricolage Grotesque, sans-serif' }}>5.8h</span>
                <span style={{ fontSize: '9px', color: T.textSecondary, fontFamily: 'Inter, sans-serif' }}>daily avg 4.6h</span>
              </div>
            </GlassCard>

            <GlassCard style={{ padding: '12px' }}>
              <div style={{ fontSize: '10px', color: T.textTertiary, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', marginBottom: '9px' }}>Time mix</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categories.map(cat => (
                  <div key={cat.l}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '9px', color: T.textSecondary, fontFamily: 'Inter, sans-serif' }}>{cat.l}</span>
                      <span style={{ fontSize: '9px', color: cat.c, fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>{cat.v}%</span>
                    </div>
                    <div style={{ height: '5px', borderRadius: '100px', backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{ width: `${cat.v}%`, height: '100%', borderRadius: '100px', backgroundColor: cat.c }} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Insights list */}
        <section style={{
          flex: 1, minHeight: 0,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{
            fontSize: '11px', color: T.textTertiary, fontFamily: 'Inter, sans-serif',
            textTransform: 'uppercase', marginBottom: '8px', flexShrink: 0,
          }}>
            Highlights
          </div>
          <div className="phone-scroll" style={{ flex: 1, overflowY: 'auto', paddingBottom: '74px', display: 'flex', flexDirection: 'column', gap: '7px', ...hiddenPhoneScroll }}>
            {insights.map((ins, i) => (
              <GlassCard key={i} style={{ padding: '9px 10px', display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '9px', flexShrink: 0,
                  backgroundColor: `${ins.c}18`, border: `1px solid ${ins.c}33`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', color: ins.c, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                }}>
                  {ins.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: T.textPrimary, fontFamily: 'Inter, sans-serif', fontWeight: 700, marginBottom: '2px' }}>{ins.title}</div>
                  <div style={{ fontSize: '10px', color: T.textSecondary, fontFamily: 'Inter, sans-serif', lineHeight: 1.35 }}>
                    {ins.text}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

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
    desc: 'One dashboard. Every priority. Complete clarity from the moment you open the app.',
  },
  {
    name: 'Planner', Component: PlannerScreen, side: 'right',
    title: 'Describe your day. SYNQ builds it.',
    desc: 'Drop in the chaos. AI turns your plans, obligations, and goals into a realistic timeline you can actually follow.',
  },
  {
    name: 'Calendar', Component: CalendarScreen, side: 'left',
    title: 'Build your streak',
    desc: 'Your year, visualized. Every square is proof that consistency beats motivation.',
  },
  {
    name: 'Journal', Component: JournalScreen, side: 'right',
    title: 'Reflect, daily',
    desc: 'Reflection, without the friction. AI captures the essence of your day, so you can focus on the moments that matter.',
  },
  {
    name: 'Analytics', Component: AnalyticsScreen, side: 'left',
    title: 'Know your patterns',
    desc: 'The numbers never lie. Understand your habits, measure your growth, and improve with confidence every day.',
  },
]

const KEY_MAP = { dashboard: 'Dashboard', planner: 'Planner', calendar: 'Calendar', journal: 'Journal', analytics: 'Analytics' }

export default function Showcase() {
  const scrollContainerRef = useRef(null)
  const dockScrollTimeoutRef = useRef(null)
  const isDockScrollingRef = useRef(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const showcaseHeight = `${(SCREENS.length + 1) * 100}vh`

  useEffect(() => {
    let raf = null
    const handleScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = null
        const el = scrollContainerRef.current
        if (!el) return
        if (isDockScrollingRef.current) return

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
      if (dockScrollTimeoutRef.current) clearTimeout(dockScrollTimeoutRef.current)
    }
  }, [])

  const { Component } = SCREENS[activeIndex]

  const handleDockNavigate = (key) => {
    const targetName = KEY_MAP[key]
    if (!targetName) return
    const targetIndex = SCREENS.findIndex(s => s.name === targetName)
    if (targetIndex === -1) return
    isDockScrollingRef.current = true
    setActiveIndex(targetIndex)

    const el = scrollContainerRef.current
    if (!el) {
      isDockScrollingRef.current = false
      return
    }
    const total = el.getBoundingClientRect().height - window.innerHeight
    const targetProgress = (targetIndex + 0.5) / SCREENS.length
    const targetScroll = window.scrollY + el.getBoundingClientRect().top + targetProgress * total
    window.scrollTo({ top: targetScroll, behavior: 'smooth' })
    if (dockScrollTimeoutRef.current) clearTimeout(dockScrollTimeoutRef.current)
    dockScrollTimeoutRef.current = setTimeout(() => {
      isDockScrollingRef.current = false
      setActiveIndex(targetIndex)
    }, 700)
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
      <div ref={scrollContainerRef} style={{ position: 'relative', height: showcaseHeight }}>
        <div style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          

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
        .phone-scroll::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
    </div>
  )
}
