import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/planner', label: 'Planner' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/journal', label: 'Journal' },
  { to: '/analytics', label: 'Analytics' },
]

export default function AppLayout({ children }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const dark = theme === 'dark'

  const bg = dark ? '#0e0e0e' : '#f5f5f5'
  const sidebar = dark ? '#111111' : '#ececec'
  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  const faint = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bg }}>

      {/* SIDEBAR */}
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
            color: '#ff4d00',
            letterSpacing: '-0.5px',
          }}>
            SYNQ
          </span>
        </div>

        {/* Nav */}
        <nav style={{ padding: '8px 12px', flex: 1 }}>
          {navItems.map(item => {
            const active = location.pathname === item.to
            return (
              <Link key={item.to} to={item.to} style={{
                display: 'flex', alignItems: 'center',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '2px',
                textDecoration: 'none',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: active ? 500 : 400,
                transition: 'all 0.15s',
                backgroundColor: active ? 'rgba(255,77,0,0.1)' : 'transparent',
                color: active ? '#ff4d00' : subtle,
                borderLeft: active ? '2px solid #ff4d00' : '2px solid transparent',
              }}>
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
            {dark ? 'Light mode' : 'Dark mode'}
          </button>

          <div style={{
            padding: '12px 14px', borderRadius: '12px',
            backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${faint}`,
          }}>
            <div style={{
              fontSize: '13px', fontFamily: 'Inter, sans-serif',
              color: text, fontWeight: 500, marginBottom: '2px',
            }}>
              {user?.name || 'User'}
            </div>
            <div style={{
              fontSize: '11px', color: subtle,
              fontFamily: 'Inter, sans-serif', marginBottom: '10px',
            }}>
              {user?.email || ''}
            </div>
            <button onClick={() => { logout(); navigate('/') }} style={{
              fontSize: '12px', fontFamily: 'Inter, sans-serif',
              color: '#ff4d00', background: 'none',
              border: 'none', cursor: 'pointer', padding: 0,
            }}>
              Log out →
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{
        marginLeft: '200px', flex: 1,
        padding: '40px 48px',
        minHeight: '100vh',
      }}>
        {children}
      </main>
    </div>
  )
}