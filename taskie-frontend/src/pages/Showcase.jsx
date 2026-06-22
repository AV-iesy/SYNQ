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
  const monthColors = ['#4a6fd4','#8b2252','#6b7c2e','#c0392b','#c9944a','#ff4d00','#666','#8b4fb5','#1a3a8f','#7a3010','#4a90d9','#8b1a1a']
  return (
    <div style={{ padding: '20px 14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif', marginBottom: '2px' }}>Archive</div>
      <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '20px', fontWeight: 700, color: '#ff4d00', marginBottom: '16px' }}>Calendar</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        {monthColors.slice(0, 9).map((c, i) => (
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

const SCREENS = [
  { name: 'Dashboard', Component: DashboardScreen },
  { name: 'Calendar', Component: CalendarScreen },
  { name: 'Journal', Component: JournalScreen },
  { name: 'Analytics', Component: AnalyticsScreen },
]

function MultiPhoneHero() {
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: '32px', padding: '20px 40px 60px' }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: '700px', height: '380px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,77,0,0.18) 0%, transparent 70%)',
        filter: 'blur(50px)', zIndex: 0,
      }} />

      {SCREENS.map((s) => (
        <div
          key={s.name}
          style={{
            position: 'relative',
            zIndex: 1,
            filter: 'drop-shadow(0 20px 45px rgba(0,0,0,0.55))',
          }}
        >
          <Iphone width={230}>
            <s.Component />
          </Iphone>

          {/* Label */}
          <div
  style={{
    position: 'absolute',
    bottom: '-36px',
    left: '50%',
    transform: 'translateX(-50%)',
  }}
>
  <span
    style={{
      fontSize: '16px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
      color: '#ff4d00',
    }}
  >
    {s.name}
  </span>
</div>
        </div>
      ))}
    </div>
  )
}

export default function Showcase() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080808', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '28px 48px', position: 'relative', zIndex: 2,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <InfinityIcon size={26} color="#ff4d00" strokeWidth={2.5} />
          <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '17px', color: '#f0f0f0' }}>SYNQ</span>
        </Link>
        <Link
          to="/login"
          style={{
            padding: '10px 22px', borderRadius: '8px',
            backgroundColor: '#ff4d00', color: 'white',
            fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px',
            textDecoration: 'none',
          }}
        >
          Log in →
        </Link>
      </div>

      {/* Hero text */}
      <div style={{ textAlign: 'center', padding: '20px 24px 0', position: 'relative', zIndex: 2 }}>
        <div style={{
          fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700,
          fontSize: 'clamp(40px, 7vw, 90px)', lineHeight: 1.02,
          color: '#f0f0f0', letterSpacing: '-2px', textTransform: 'lowercase',
        }}>
          built for the<br />
          <span style={{ color: '#ff4d00' }}>consistent.</span>
        </div>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.4)',
          maxWidth: '420px', margin: '20px auto 0', lineHeight: 1.6,
        }}>
          SYNQ is built for people who show up daily — plan, track, reflect, and grow with everything in one rhythm.
        </p>
      </div>

{/* Hero phones */}
<div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', position: 'relative', zIndex: 1 }}>
  <MultiPhoneHero />
</div>

      {/* Bottom CTA */}
      <div style={{ textAlign: 'center', padding: '60px 24px 80px', position: 'relative', zIndex: 2 }}>
        <Link
          to="/login"
          style={{
            display: 'inline-block', padding: '15px 36px', borderRadius: '10px',
            backgroundColor: '#ff4d00', color: 'white',
            fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: '15px',
            textDecoration: 'none',
          }}
        >
          Start your streak →
        </Link>
      </div>
    </div>
  )
}
