import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('SYNQ-token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.get(`${BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setUser(res.data.user))
        .catch(() => {
          setToken(null)
          localStorage.removeItem('SYNQ-token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const res = await axios.post(`${BASE}/auth/login`, { email, password })
    const { token: t, user: u } = res.data
    setToken(t)
    setUser(u)
    localStorage.setItem('SYNQ-token', t)
    return u
  }

  const register = async (name, email, password) => {
    const res = await axios.post(`${BASE}/auth/register`, { name, email, password })
    const { token: t, user: u } = res.data
    setToken(t)
    setUser(u)
    localStorage.setItem('SYNQ-token', t)
    return u
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('SYNQ-token')
  }

  const updatePreferences = (prefs) => {
    setUser(prev => ({ ...prev, preferences: { ...prev.preferences, ...prefs } }))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)