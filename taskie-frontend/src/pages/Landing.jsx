import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#080808' }}>
      <Link
        to="/login"
        style={{
          color: 'rgba(255,255,255,0.4)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          textDecoration: 'none',
        }}
      >
        Go to Login →
      </Link>
    </div>
  )
}
