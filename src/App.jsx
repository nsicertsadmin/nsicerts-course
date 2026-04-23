import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/AuthContext'
import Topbar from './components/Topbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CoursePlayer from './pages/CoursePlayer'
import FinalExam from './pages/FinalExam'
import Certificate from './pages/Certificate'
import Verify from './pages/Verify'
import ResetPassword from './pages/ResetPassword'
import Checkout from './pages/Checkout'
import Cart from './pages/Cart'
import Admin from './pages/Admin'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'var(--gray-600)'}}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <div className="app-shell">
      <Routes>
        {/* Public pages — no topbar, no login required */}
        <Route path="/verify/:certNumber" element={<Verify />} />

        {/* Auth pages — no topbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* App pages — with topbar */}
        <Route path="/*" element={
          <>
            <Topbar />
            <Routes>
              <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/course/:courseId" element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>} />
              <Route path="/course/:courseId/exam" element={<ProtectedRoute><FinalExam /></ProtectedRoute>} />
              <Route path="/certificate/:courseId" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
              <Route path="/checkout/:courseId" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            </Routes>
          </>
        } />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
