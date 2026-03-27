import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { supabase } from '../lib/supabase'

const COURSES = [
  {
    id: 'mewp',
    title: 'MEWP Operator Safety',
    subtitle: 'Aerial & Scissor Lifts',
    tag: 'OSHA COMPLIANT',
    description: 'Complete training for Mobile Elevating Work Platforms including boom lifts, scissor lifts, and aerial work platforms. Groups A & B, Types 1-3.',
    duration: '60-90 min',
    chapters: 8,
    standards: 'OSHA 29 CFR 1926.453 · ANSI A92.22 · CSA B354.6',
    available: true,
  },
  {
    id: 'forklift',
    title: 'Forklift Operator Safety',
    subtitle: 'Powered Industrial Trucks',
    tag: 'OSHA COMPLIANT',
    description: 'Comprehensive forklift safety training covering operation, inspection, and hazard recognition.',
    duration: '60-90 min',
    chapters: 7,
    standards: 'OSHA 29 CFR 1910.178 · ANSI/ITSDF B56.1',
    available: false,
  },
  {
    id: 'fall',
    title: 'Fall Protection',
    subtitle: 'Working at Heights',
    tag: 'OSHA COMPLIANT',
    description: 'Essential fall protection training including guardrails, personal fall arrest systems, and safety nets.',
    duration: '45-60 min',
    chapters: 6,
    standards: 'OSHA 29 CFR 1926.501 · ANSI/ASSP Z359.2',
    available: false,
  },
  {
    id: 'hazcom',
    title: 'HazCom / GHS',
    subtitle: 'Hazard Communication',
    tag: 'OSHA COMPLIANT',
    description: 'Understand Safety Data Sheets, chemical labels, and GHS pictograms for workplace chemical safety.',
    duration: '45-60 min',
    chapters: 5,
    standards: 'OSHA 29 CFR 1910.1200',
    available: false,
  },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [progress, setProgress] = useState({})

  useEffect(() => {
    if (!user) return
    loadProgress()
  }, [user])

  const loadProgress = async () => {
    const { data } = await supabase
      .from('course_progress')
      .select('course_id, completed_chapters, passed_final, cert_number')
      .eq('user_id', user.id)
    if (data) {
      const map = {}
      data.forEach(row => { map[row.course_id] = row })
      setProgress(map)
    }
  }

  const getProgressPct = (courseId, totalChapters) => {
    const p = progress[courseId]
    if (!p) return 0
    if (p.passed_final) return 100
    return Math.round(((p.completed_chapters || []).length / totalChapters) * 100)
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <h1>Welcome back, {firstName} 👋</h1>
        <p>Continue your safety training and earn your certifications.</p>
      </div>

      <div className="courses-grid">
        {COURSES.map(course => {
          const pct = getProgressPct(course.id, course.chapters)
          const p = progress[course.id]
          const started = pct > 0
          const completed = p?.passed_final

          return (
            <div className="course-card" key={course.id}>
              <div className="course-card-header">
                <div className="course-tag">{course.tag}</div>
                <h3>{course.title}</h3>
                <div style={{fontSize:'0.75rem', color:'#9ca3af', marginTop:'0.25rem'}}>{course.subtitle}</div>
              </div>

              <div className="course-card-body">
                <p>{course.description}</p>
                {course.available && (
                  <div className="progress-bar-wrap">
                    <div className="progress-bar-label">
                      <span style={{color: completed ? 'var(--green)' : undefined}}>
                        {completed ? '✅ Certified' : started ? 'In Progress' : 'Not started'}
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-bar-fill" style={{width:`${pct}%`, background: completed ? 'var(--green)' : undefined}}/>
                    </div>
                  </div>
                )}
              </div>

              <div className="course-card-footer" style={{flexDirection:'column', gap:'0.625rem', alignItems:'stretch'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div className="course-meta">{course.duration} · {course.chapters} chapters</div>
                  {course.available ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      {completed ? 'Review' : started ? 'Continue →' : 'Start →'}
                    </button>
                  ) : (
                    <span className="badge-locked">🔒 Coming Soon</span>
                  )}
                </div>

                {/* Certificate button — grayed out until completed */}
                {course.available && (
                  <button
                    className="btn btn-sm"
                    style={{
                      width: '100%',
                      background: completed ? 'var(--navy)' : 'var(--gray-100)',
                      color: completed ? 'var(--gold)' : 'var(--gray-400)',
                      border: completed ? '1px solid var(--gold)' : '1px solid var(--gray-200)',
                      cursor: completed ? 'pointer' : 'not-allowed',
                      fontWeight: 600,
                    }}
                    disabled={!completed}
                    onClick={() => completed && navigate(`/certificate/${course.id}`)}
                  >
                    🎓 {completed ? 'View Certificate' : 'Complete Course to Unlock Certificate'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
