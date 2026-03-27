import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function Topbar() {
  const { user, signOut } = useAuth()

  return (
    <div className="topbar">
      <Link to="/" className="topbar-logo">
        NSI <span>Course Portal</span>
      </Link>
      <nav className="topbar-nav">
        {user ? (
          <>
            <Link to="/dashboard">My Courses</Link>
            <a href="https://nsicerts.org" target="_blank" rel="noreferrer">NSICerts.org</a>
            <button onClick={signOut}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login">Sign In</Link>
            <Link to="/signup">
              <button className="btn btn-primary btn-sm">Enroll Now</button>
            </Link>
          </>
        )}
      </nav>
    </div>
  )
}
