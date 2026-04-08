import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'

export default function Login() {
  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login') // 'login' | 'forgot'
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) { setError('Invalid email or password. Please try again.'); return }
    navigate('/dashboard')
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) { setError(error.message); return }
    setResetSent(true)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <h1>NSI</h1>
          <p>National Safety Institute — Course Portal</p>
        </div>

        {/* FORGOT PASSWORD - success state */}
        {mode === 'forgot' && resetSent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📧</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Check your email</h2>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              We sent a password reset link to <strong>{email}</strong>.<br />
              Click the link in the email to set a new password.
            </p>
            <button
              className="btn btn-ghost"
              onClick={() => { setMode('login'); setResetSent(false); setEmail('') }}
            >
              ← Back to Sign In
            </button>
          </div>

        /* FORGOT PASSWORD - form */
        ) : mode === 'forgot' ? (
          <>
            <h2>Reset your password</h2>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Enter your email and we'll send you a reset link.
            </p>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <div className="auth-switch">
              <button onClick={() => { setMode('login'); setError('') }}>← Back to Sign In</button>
            </div>
          </>

        /* LOGIN - form */
        ) : (
          <>
            <h2>Sign in to your account</h2>
            {error && <div className="error-msg">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError('') }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--navy)', fontSize: '0.8rem', fontWeight: 600,
                      textDecoration: 'underline', padding: 0
                    }}
                  >
                    Forgot password?
                  </button>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div className="auth-switch">
              Don't have an account? <button onClick={() => navigate('/signup')}>Create one</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
