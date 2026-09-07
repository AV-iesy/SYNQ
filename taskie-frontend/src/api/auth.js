import api from './axios'

export const register = async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password })
  return data
}

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export const logout = async (token) => {
  await api.post('/auth/logout', {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export const getMe = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

export const updatePreferences = async (preferences) => {
  const { data } = await api.put('/auth/preferences', preferences)
  return data
}
