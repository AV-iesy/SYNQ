import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
})

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('synq-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401s globally — token expired/invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('synq-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
