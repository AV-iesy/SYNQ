import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'
import ShineBorder from '../components/common/ShineBorder'

export default function Login() {
  const { login, register } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const dark = theme === 'dark'

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
  e.preventDefault()
  if (!form.email || !form.password) return toast.error('Fill in all fields')
  if (!isLogin && !form.name) return toast.error('Enter your name')

  setLoading(true)
  try {
    if (isLogin) {
      await login(form.email, form.password)
    } else {
      await register(form.name, form.email, form.password)
    }
    toast.success(isLogin ? 'Welcome back!' : 'Account created!')
    navigate('/dashboard')
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Something went wrong')
  } finally {
    setLoading(false)
  }
}

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#080808' }}
    >


      {/* Logo */}
      <Link
  to="/"
  className="flex items-center gap-2 mb-10"
  style={{
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontWeight: 600,
    fontSize: '30px',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  }}
>
  <span style={{ color: '#E53935' }}>SYNQ</span>
</Link>

      {/* Card */}
      {/* Card */}
<div
  className="w-full max-w-sm rounded-2xl p-8"
  style={{
    position: 'relative',
    background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
    overflow: 'hidden',
  }}
>
  <ShineBorder shineColor={['#ff4d00', '#ff8a4d', '#ffd9b3']} borderWidth={1.5} duration={6} />
        {/* Toggle */}
        <div
          className="flex rounded-xl p-1 mb-8"
          style={{
            background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}
        >
          {['Login', 'Register'].map((tab) => (
            <button
              key={tab}
              onClick={() => setIsLogin(tab === 'Login')}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: (isLogin ? tab === 'Login' : tab === 'Register')
                  ? dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
                  : 'transparent',
                color: (isLogin ? tab === 'Login' : tab === 'Register')
                  ? dark ? '#f0f0f0' : '#0a0a0a'
                  : dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Heading */}
        <h1
          className="mb-1"
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '-0.5px',
            color: dark ? '#f0f0f0' : '#0a0a0a',
          }}
        >
          {isLogin ? 'Welcome back' : 'Create account'}
        </h1>
        <p
          className="mb-7 text-sm"
          style={{ color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}
        >
          {isLogin ? 'Log in to your SYNQ account' : 'Start planning your days with AI'}
        </p>

        {/* Form */}
        <form onSubmit={submit} className="flex flex-col gap-3">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs"
                style={{ color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}
              >
                Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={handle}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  color: dark ? '#f0f0f0' : '#0a0a0a',
                  fontFamily: 'Inter, sans-serif',
                }}
                onFocus={e => e.target.style.borderColor = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                onBlur={e => e.target.style.borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs"
              style={{ color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}
            >
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handle}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                color: dark ? '#f0f0f0' : '#0a0a0a',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
              onBlur={e => e.target.style.borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-xs"
              style={{ color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}
            >
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handle}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                color: dark ? '#f0f0f0' : '#0a0a0a',
                fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => e.target.style.borderColor = dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
              onBlur={e => e.target.style.borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-medium mt-2 transition-all"
            style={{
              background: dark ? '#f0f0f0' : '#0a0a0a',
              color: dark ? '#080808' : '#fafafa',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {loading ? '...' : isLogin ? 'Log in' : 'Create account'}
          </button>
        </form>

        {/* Footer note */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
        >
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="underline"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
            }}
          >
            {isLogin ? 'Register' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}