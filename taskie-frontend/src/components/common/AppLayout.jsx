import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦' },
  { to: '/planner', label: 'Planner', icon: '◈' },
  { to: '/journal', label: 'Journal', icon: '◎' },
  { to: '/analytics', label: 'Analytics', icon: '◉' },
]

export default function AppLayout({ children }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const dark = theme === 'dark'

  const text = dark ? '#f0f0f0' : '#0a0a0a'
  const subtle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'
  const faint = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: dark ? '#080808' : '#fafafa' }}>
      <aside style={{
        width: '220px', minHeight: '100vh', display: 'flex', flexDirection: 'column',
        borderRight: `1px solid ${faint}`, backgroundColor: cardBg,
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
      }}>
        <div style={{ padding: '28px 24px 24px', borderBottom: `1px solid ${faint}` }}>
          <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 600, fontSize: '18px', color: text, letterSpacing: '-0.5px' }}>
            SYNQ
          </span>
        </div>
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          {navItems.map(item => {
            const active = location.pathname === item.to
            return (
              <Link key={item.to} to={item.to} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', marginBottom: '2px',
                textDecoration: 'none', fontSize: '14px', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.15s',
                backgroundColor: active ? (dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)') : 'transparent',
                color: active ? text : subtle,
                fontWeight: active ? 500 : 400,
              }}>
                <span style={{ fontSize: '13px', opacity: 0.7 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: `1px solid ${faint}`, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={toggleTheme} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px', border: 'none',
            backgroundColor: 'transparent', color: subtle, fontSize: '14px',
            fontFamily: 'Inter, sans-serif', cursor: 'pointer', width: '100%', textAlign: 'left',
          }}>
            <span style={{ fontSize: '13px' }}>{dark ? '○' : '●'}</span>
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
          <div style={{
            padding: '10px 12px', borderRadius: '10px',
            backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            border: `1px solid ${faint}`,
          }}>
            <div style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', color: text, fontWeight: 500, marginBottom: '2px' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '11px', color: subtle, fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>
              {user?.email || ''}
            </div>
            <button onClick={handleLogout} style={{
              fontSize: '12px', fontFamily: 'Inter, sans-serif', color: subtle,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>
              Log out →
            </button>
          </div>
        </div>
      </aside>
      <main style={{ marginLeft: '220px', flex: 1, padding: '40px', minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
