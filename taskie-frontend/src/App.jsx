import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { PageTransitionProvider } from './context/PageTransitionContext'
import PrivateRoute from './components/common/PrivateRoute'

import Landing from './pages/Landing'
import Showcase from './pages/Showcase'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import Calendar from './pages/Calendar'
import Journal from './pages/Journal'
import Analytics from './pages/Analytics'

export default function App() {
  console.log('APP RENDERED')
  return (
    <ThemeProvider>
      <AuthProvider>
        <PageTransitionProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#111',
                  color: '#f0f0f0',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontSize: '14px',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/showcase" element={<Showcase />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/calendar" element={<Calendar />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </PageTransitionProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}