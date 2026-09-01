import { createContext, useContext, useState, useEffect } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('synq-token'))
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('synq-token')))

  useEffect(() => {
    if (!token) return
    let cancelled = false
    authApi.getMe()
      .then(data => { if (!cancelled) setUser(data.user) })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
          setLoading(false)
          setToken(null)
        }
        localStorage.removeItem('synq-token')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('synq-token', data.token)
    return data.user
  }

  const register = async (name, email, password) => {
    const data = await authApi.register(name, email, password)
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('synq-token', data.token)
    return data.user
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('synq-token')
  }

  const updatePreferences = async (prefs) => {
    const data = await authApi.updatePreferences(prefs)
    setUser(data.user)
    return data.user
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
