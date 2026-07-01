// import { Outlet } from 'react-router-dom'

// export default function PrivateRoute() {
//   return <Outlet />
// }

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function PrivateRoute() {
  const { user, token, loading } = useAuth()

  // Still verifying token — don't redirect yet
  if (loading) return null

  // No valid session — send to login
  if (!token || !user) return <Navigate to="/login" replace />

  // Valid session — render the protected page
  return <Outlet />
}