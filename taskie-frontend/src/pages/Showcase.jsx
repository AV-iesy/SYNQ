import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import InfinityIcon from '../components/common/InfinityIcon'
import Iphone from '../components/common/Iphone'

// ── Mini screen recreations ─────────────────────────────────
function DashboardScreen() {
  return (
    <div style={{ padding: '20px 14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', marginBottom: '2px' }}>Saturday, June 20</div>
      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '20px', fontWeight: 700, color: '#ff4d00', marginBottom: '16px' }}>Dashboard</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,77,0,0.15)" strokeWidth="7" />
          <circle cx="32" cy="32" r="26" fill="none" stroke="#ff4d00" strokeWidth="7" strokeDasharray="163" strokeDashoffset="50" strokeLinecap="round" />
          <circle cx="32" cy="32" r="18" fill="none" stroke="rgba(90,173,122,0.15)" strokeWidth="6" />
          <circle cx="32" cy="32" r="18" fill="none" stroke="#5aad7a" strokeWidth="6" strokeDasharray="113" strokeDashoffset="30" strokeLinecap="round" />
        </svg>
        <div>
          <div style={{ fontSize: '7px', color: '#ff4d00', fontFamily: 'Inter, sans-serif' }}>70% completion</div>
          <div style={{ fontSize: '7px', color: '#5aad7a', fontFamily: 'Inter, sans-serif' }}>65% tasks</div>
        </div>
      </div>

      <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', marginBottom: '6px' }}>TODAY'S SCHEDULE</div>
      {[
        { t: '06:00', l: 'Wake up', c: '#c9944a' },
        { t: '09:00', l: 'Deep work', c: '#4a90d9' },
        { t: '13:00', l: 'Gym', c: '#ff4d00' },
      ].map((b, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '6px', marginBottom: '4px' }}>
          <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)', minWidth: '24px', fontFamily: 'Inter, sans-serif' }}>{b.t}</span>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: b.c }} />
          <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif' }}>{b.l}</span>
        </div>
      ))}
    </div>
  )
}

function CalendarScreen() {
  const monthColors = ['#4a6fd4','#8b2252','#6b7c2e','#c0392b','#c9944a','#ff4d00','#666','#8b4fb5','#1a3a8f']
  return (
    <div style={{ padding: '20px 14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', marginBottom: '2px' }}>Archive</div>
      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '20px', fontWeight: 700, color: '#ff4d00', marginBottom: '16px' }}>Calendar</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        {monthColors.map((c, i) => (
          <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ backgroundColor: c, padding: '4px 6px', fontSize: '7px', color: 'white', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700 }}>
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
          </div>
        ))}
      </div>
    </div>
  )
}

function JournalScreen() {
  return (
    <div style={{ padding: '20px 14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', marginBottom: '2px' }}>Saturday, June 20</div>
      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '20px', fontWeight: 700, color: '#ff4d00', marginBottom: '16px' }}>Journal</div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {[{ l: 'Great', c: '#ff4d00', a: true }, { l: 'Good', c: '#5aad7a' }, { l: 'Okay', c: '#4a90d9' }].map((m, i) => (
          <div key={i} style={{
            fontSize: '7px', padding: '5px 10px', borderRadius: '100px',
            color: m.a ? m.c : 'rgba(255,255,255,0.3)',
            backgroundColor: m.a ? `${m.c}22` : 'transparent',
            border: `1px solid ${m.a ? m.c + '55' : 'rgba(255,255,255,0.08)'}`,
            fontFamily: 'Inter, sans-serif',
          }}>{m.l}</div>
        ))}
      </div>

      <div style={{
        backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px', padding: '12px', fontSize: '8px', color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Inter, sans-serif', lineHeight: 1.7, marginBottom: '12px',
      }}>
        Today I worked through gym, deep work session, and evening reading. Felt productive and focused throughout most of the day...
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
        {Array.from({ length: 21 }, (_, i) => (
          <div key={i} style={{
            aspectRatio: '1', borderRadius: '4px',
            backgroundColor: [1,4,6,9,12,15,18].includes(i) ? 'rgba(255,77,0,0.3)' : 'rgba(255,255,255,0.03)',
          }} />
        ))}
      </div>
    </div>
  )
}

function AnalyticsScreen() {
  const bars = [40, 65, 30, 80, 55, 90, 70]
  return (
    <div style={{ padding: '20px 14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', marginBottom: '2px' }}>Insights</div>
      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '20px', fontWeight: 700, color: '#ff4d00', marginBottom: '16px' }}>Analytics</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
        {[{ l: 'Avg Completion', v: '78%', c: '#ff4d00' }, { l: 'Focus Time', v: '5h 20m', c: '#4a90d9' }].map((s, i) => (
          <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '8px' }}>
            <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}>{s.l}</div>
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '13px', fontWeight: 700, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>FOCUS HOURS</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '70px' }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, backgroundColor: '#ff4d00', borderRadius: '3px 3px 0 0' }} />
        ))}
      </div>
    </div>
  )
}

// function SplashScreen() {
//   const words = ['built', 'for', 'the', 'consistent.']
// const finalWords = ['be', 'consistent.']
//   const [visibleCount, setVisibleCount] = useState(0)
//   const [isolated, setIsolated] = useState(false)

//   useEffect(() => {
//     const timers = []
//     words.forEach((_, i) => {
//       timers.push(setTimeout(() => setVisibleCount(i + 1), i * 450))
//     })
//     // After all words shown, wait 1s, then isolate "consistent."
//     timers.push(setTimeout(() => setIsolated(true), words.length * 450 + 1000))
//     return () => timers.forEach(clearTimeout)
//   }, [])

//   return (
//     <div style={{
//       height: '100%', display: 'flex', flexDirection: 'column',
//       alignItems: 'center', justifyContent: 'center', padding: '0 20px',
//       textAlign: 'center',
//     }}>
//       <div style={{
//         fontFamily: 'Helvetica, sans-serif', fontWeight: 600,
//         fontSize: '48px', lineHeight: 1.3,
//         letterSpacing: '-0.02em', textTransform: 'lowercase',
//       }}>
//         {!isolated ? (
//   words.map((word, i) => {
//     const isLast = i === words.length - 1
//     const shown = i < visibleCount
//     return (
//       <span key={i}>
//         <span
//           style={{
//             display: 'inline-block',
//             color: isLast ? '#ff4d00' : '#f0f0f0',
//             opacity: shown ? 1 : 0,
//             transform: shown ? 'translateY(0)' : 'translateY(8px)',
//             transition: 'opacity 0.5s ease, transform 0.5s ease',
//           }}
//         >
//           {word}
//         </span>
//         {i < words.length - 1 ? ' ' : ''}
//         {i === 2 ? <br /> : ''}
//       </span>
//     )
//   })
// ) : (
//   <span style={{ animation: 'fadeInScale 0.6s ease forwards' }}>
//     <span style={{ color: '#f0f0f0' }}>{finalWords[0]}</span>{' '}
//     <span style={{
//       color: '#ff4d00',
//       fontSize: '34px',
//       textShadow: '0 0 24px rgba(255,77,0,0.6)',
//     }}>
//       {finalWords[1]}
//     </span>
//   </span>
// )}
//       </div>
//     </div>
//   )
// }
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

export default function Showcase() {
  const scrollContainerRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const el = scrollContainerRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const scrolled = -rect.top
      const progress = Math.min(1, Math.max(0, scrolled / total))

      const index = Math.min(SCREENS.length - 1, Math.floor(progress * SCREENS.length))
      setActiveIndex(index)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const { Component, name } = SCREENS[activeIndex]

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
        <Component />
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
