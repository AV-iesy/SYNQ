// import { Link, useLocation, useNavigate } from 'react-router-dom'
// import { useTheme } from '../../context/ThemeContext'
// import { useAuth } from '../../context/AuthContext'
// import { usePageTransition } from '../../context/PageTransitionContext'
// import InteractiveHoverButton from './InteractiveHoverButton'
// import DotMatrixLoader from './DotMatrixLoader'

// const navItems = [
//   { to: '/dashboard', label: 'Dashboard' },
//   { to: '/planner', label: 'Planner' },
//   { to: '/calendar', label: 'Calendar' },
//   { to: '/journal', label: 'Journal' },
//   { to: '/analytics', label: 'Analytics' },
// ]

// export default function AppLayout({ children }) {
//   const { theme, toggleTheme } = useTheme()
//   const { user, logout } = useAuth()
//   const location = useLocation()
//   const navigate = useNavigate()
//   const dark = theme === 'dark'
//   const { transitioning, startTransition, endTransition } = usePageTransition()

//   const handleNavClick = (e, to) => {
//     e.preventDefault()
//     if (location.pathname === to) return

//     const readyPromise = startTransition()
//     const minDelay = new Promise(resolve => setTimeout(resolve, 1000))

//     navigate(to)

//     Promise.all([readyPromise, minDelay]).then(() => {
//       endTransition()
//     })
//   }

//   const bg = dark ? '#000000' : '#f5f5f5'
//   const sidebar = dark ? '#000000' : '#ececec'
//   const text = dark ? '#f0f0f0' : '#0a0a0a'
//   const subtle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
//   const faint = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

//   return (
//     <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bg }}>

//       {/* SIDEBAR */}
//       <aside style={{
//         width: '200px', minHeight: '100vh',
//         display: 'flex', flexDirection: 'column',
//         borderRight: `1px solid ${faint}`,
//         backgroundColor: sidebar,
//         position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
//       }}>
//         {/* Logo */}
//         <div style={{ padding: '28px 24px 24px' }}>
//           <span style={{
//             fontFamily: 'Bricolage Grotesque, sans-serif',
//             fontWeight: 700, fontSize: '20px',
//             color: '#ff4d00',
//             letterSpacing: '-0.5px',
//           }}>
//             SYNQ
//           </span>
//         </div>

//         {/* Nav */}
//         <nav style={{ padding: '8px 12px', flex: 1 }}>
//           {navItems.map(item => {
//   const active = location.pathname === item.to
//   return (
//     <Link
//       key={item.to}
//       to={item.to}
//       onClick={(e) => handleNavClick(e, item.to)}
//       style={{
//         display: 'flex', alignItems: 'center',
//         padding: '10px 14px',
//         borderRadius: '10px',
//         marginBottom: '2px',
//         textDecoration: 'none',
//         fontSize: '14px',
//         fontFamily: 'Inter, sans-serif',
//         fontWeight: active ? 500 : 400,
//         transition: 'all 0.15s',
//         backgroundColor: active ? 'rgba(255,77,0,0.1)' : 'transparent',
//         color: active ? '#ff4d00' : subtle,
//         borderLeft: active ? '2px solid #ff4d00' : '2px solid transparent',
//       }}
//     >
//       {item.label}
//     </Link>
//   )
// })}
//         </nav>

//         {/* Bottom */}
//         <div style={{ padding: '16px 12px', borderTop: `1px solid ${faint}` }}>
//           <button onClick={toggleTheme} style={{
//             display: 'flex', alignItems: 'center', gap: '10px',
//             padding: '10px 14px', borderRadius: '10px',
//             border: 'none', backgroundColor: 'transparent',
//             color: subtle, fontSize: '13px',
//             fontFamily: 'Inter, sans-serif',
//             cursor: 'pointer', width: '100%', textAlign: 'left',
//             marginBottom: '8px',
//           }}>
//             {dark ? 'Light mode' : 'Dark mode'}
//           </button>

//           <div style={{
//             padding: '12px 14px', borderRadius: '12px',
//             backgroundColor: dark ? 'rgba(255,255,255,0)' : 'rgba(0,0,0,0)',
//             border: `1px solid ${faint}`,
//           }}>
//             <div style={{
//               fontSize: '13px', fontFamily: 'Inter, sans-serif',
//               color: text, fontWeight: 500, marginBottom: '2px',
//             }}>
//               {user?.name || 'User'}
//             </div>
//             <div style={{
//               fontSize: '11px', color: subtle,
//               fontFamily: 'Inter, sans-serif', marginBottom: '10px',
//             }}>
//               {user?.email || ''}
//             </div>
//             <InteractiveHoverButton onClick={() => { logout(); navigate('/') }} dark={dark}>
//                Log out →
//             </InteractiveHoverButton>
//           </div>
//         </div>
//       </aside>

//       {/* MAIN */}
//       <main style={{
//         marginLeft: '200px', flex: 1,
//         padding: '40px 48px',
//         minHeight: '100vh',
//       }}>
//         {children}
//       </main>

//       {/* Route transition overlay */}
//       {transitioning && (
//         <div style={{
//           position: 'fixed', inset: 0, zIndex: 999,
//           backgroundColor: bg,
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//         }}>
//           <DotMatrixLoader size={56} dotSize={7} color="#ffffff" speed={1.2} />
//         </div>
//       )}
//     </div>
//   )
// }


import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'
import InteractiveHoverButton from './InteractiveHoverButton'
import DotMatrixLoader from './DotMatrixLoader'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  )},
  { to: '/planner', label: 'Planner', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L14 9H20L15 13L17 19L12 15L7 19L9 13L4 9H10L12 3Z" fill="currentColor" />
    </svg>
  )},
  { to: '/calendar', label: 'Calendar', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M3 9.5H21" stroke="currentColor" strokeWidth="2" />
      <path d="M8 3V6.5M16 3V6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )},
  { to: '/journal', label: 'Journal', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 20L4.8 16.2L16 5L19 8L7.8 19.2L4 20Z" fill="currentColor" />
    </svg>
  )},
  { to: '/analytics', label: 'Analytics', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="13" width="4" height="8" rx="1" fill="currentColor" opacity="0.5" />
      <rect x="10" y="8" width="4" height="13" rx="1" fill="currentColor" />
      <rect x="16" y="3" width="4" height="18" rx="1" fill="currentColor" opacity="0.8" />
    </svg>
  )},
]

export default function AppLayout({ children }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { isMobile } = useBreakpoint()
  const dark = theme === 'dark'
  const [transitioning, setTransitioning] = useState(false)

  const handleNavClick = (e, to) => {
    e.preventDefault()
    if (location.pathname === to) return
    setTransitioning(true)
    setTimeout(() => {
      navigate(to)
      setTransitioning(false)
    }, 1000)
  }

  const bg = dark ? '#000000' : '#f5f5f5'
  const sidebar = dark ? '#000000' : '#ececec'
  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  const faint = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bg }}>

      {/* ── DESKTOP SIDEBAR ─────────────────────────── */}
      {!isMobile && (
        <aside style={{
          width: '200px', minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${faint}`,
          backgroundColor: sidebar,
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        }}>
          {/* Logo */}
          <div style={{ padding: '28px 24px 24px' }}>
            <span style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700, fontSize: '20px',
              color: '#ff4d00', letterSpacing: '-0.5px',
            }}>
              SYNQ
            </span>
          </div>

          {/* Nav */}
          <nav style={{ padding: '8px 12px', flex: 1 }}>
            {navItems.map(item => {
              const active = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={(e) => handleNavClick(e, item.to)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '10px 14px', borderRadius: '10px',
                    marginBottom: '2px', textDecoration: 'none',
                    fontSize: '14px', fontFamily: 'Inter, sans-serif',
                    fontWeight: active ? 500 : 400,
                    transition: 'all 0.15s',
                    backgroundColor: active ? 'rgba(255,77,0,0.1)' : 'transparent',
                    color: active ? '#ff4d00' : subtle,
                    borderLeft: active ? '2px solid #ff4d00' : '2px solid transparent',
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Bottom */}
          <div style={{ padding: '16px 12px', borderTop: `1px solid ${faint}` }}>
            <button onClick={toggleTheme} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 14px', borderRadius: '10px',
              border: 'none', backgroundColor: 'transparent',
              color: subtle, fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer', width: '100%', textAlign: 'left',
              marginBottom: '8px',
            }}>
              {dark ? '☀ Light mode' : '☾ Dark mode'}
            </button>

            <div style={{
              padding: '12px 14px', borderRadius: '12px',
              border: `1px solid ${faint}`,
            }}>
              <div style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', color: text, fontWeight: 500, marginBottom: '2px' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '10px' }}>
                {user?.email || ''}
              </div>
              <InteractiveHoverButton onClick={() => { logout(); navigate('/') }} dark={dark}>
                Log out →
              </InteractiveHoverButton>
            </div>
          </div>
        </aside>
      )}

      {/* ── MAIN CONTENT ────────────────────────────── */}
      <main style={{
        marginLeft: isMobile ? 0 : '200px',
        flex: 1,
        padding: isMobile ? '20px 16px 80px' : '40px 48px',
        minHeight: '100vh',
      }}>
        {/* Mobile header */}
        {isMobile && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '24px',
          }}>
            <span style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 700, fontSize: '22px',
              color: '#ff4d00', letterSpacing: '-0.5px',
            }}>
              SYNQ
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={toggleTheme}
                style={{
                  background: 'none', border: `1px solid ${faint}`,
                  borderRadius: '8px', padding: '6px 10px',
                  color: subtle, fontSize: '14px', cursor: 'pointer',
                }}
              >
                {dark ? '☀' : '☾'}
              </button>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff4d00, #c9390a)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700, color: 'white',
                fontFamily: 'Bricolage Grotesque, sans-serif',
              }}>
                {(user?.name || 'U')[0].toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {children}
      </main>

      {/* ── MOBILE BOTTOM TAB BAR ───────────────────── */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          padding: '10px 0 20px',
          backgroundColor: dark ? 'rgba(0,0,0,0.92)' : 'rgba(245,245,245,0.92)',
          backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${faint}`,
        }}>
          {navItems.map(item => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={(e) => handleNavClick(e, item.to)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  textDecoration: 'none', padding: '4px 12px',
                  color: active ? '#ff4d00' : subtle,
                  transition: 'color 0.15s',
                }}
              >
                <div style={{
                  color: active ? '#ff4d00' : subtle,
                  transition: 'color 0.15s',
                  transform: active ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.15s, color 0.15s',
                }}>
                  {item.icon}
                </div>
                <span style={{
                  fontSize: '10px', fontFamily: 'Inter, sans-serif',
                  fontWeight: active ? 600 : 400,
                }}>
                  {item.label}
                </span>
                {active && (
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    width: '20px', height: '2px',
                    backgroundColor: '#ff4d00',
                    borderRadius: '0 0 2px 2px',
                  }} />
                )}
              </Link>
            )
          })}
        </nav>
      )}

      {/* ── TRANSITION OVERLAY ──────────────────────── */}
      {transitioning && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          backgroundColor: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <DotMatrixLoader size={56} dotSize={7} color="#ff4d00" speed={1.2} />
        </div>
      )}
    </div>
  )
}