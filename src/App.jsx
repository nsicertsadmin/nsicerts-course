import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './components/AuthContext'
import Topbar from './components/Topbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CoursePlayer from './pages/CoursePlayer'
import FinalExam from './pages/FinalExam'
import Certificate from './pages/Certificate'

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
        {/* Auth pages — no topbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
