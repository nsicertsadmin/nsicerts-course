import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { supabase } from '../lib/supabase'
import { MEWP_COURSE } from '../lib/mewpCourse'
import ChapterQuiz from '../components/ChapterQuiz'
import CourseDiagram from '../components/CourseDiagram'

const COURSES = { mewp: MEWP_COURSE }

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((p, j) => p.startsWith('**') ? <strong key={j}>{p.slice(2, -2)}</strong> : p)
}

function renderContent(text) {
  const lines = text.trim().split('\n')
  const elements = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i}>{line.slice(3)}</h2>)

    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i}>{line.slice(4)}</h3>)

    } else if (line.startsWith('> ')) {
      elements.push(
        <div key={i} className="callout">
          <p>{renderInline(line.slice(2))}</p>
        </div>
      )

    } else if (line.startsWith('!! ')) {
      const bullets = []
      while (i < lines.length && lines[i].startsWith('!! ')) {
        bullets.push(lines[i].slice(3))
        i++
      }
      elements.push(
        <div key={`imp-${i}`} style={{
          margin:'1.25rem 0', padding:'1rem 1.25rem',
          background:'#fff8e6', border:'2px solid #C9A84C', borderRadius:8
        }}>
          <div style={{fontWeight:700, color:'#7a5c00', marginBottom:'0.5rem',
            fontSize:'0.8rem', letterSpacing:'0.5px', textTransform:'uppercase'}}>
            ⚠ Important
          </div>
          <ul style={{margin:0, paddingLeft:'1.25rem'}}>
            {bullets.map((b, j) => (
              <li key={j} style={{color:'#7a4f00', fontWeight:500, marginBottom:'0.3rem', fontSize:'0.9rem'}}>
                {renderInline(b)}
              </li>
            ))}
          </ul>
        </div>
      )
      continue

    } else if (line.startsWith('[DIAGRAM:')) {
      const diagramId = line.match(/\[DIAGRAM:([^\]]+)\]/)?.[1]
      if (diagramId) {
        elements.push(<CourseDiagram key={`diag-${i}`} id={diagramId} />)
      }

    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(<li key={i}>{renderInline(lines[i].slice(2))}</li>)
        i++
      }
      elements.push(<ul key={`ul-${i}`}>{items}</ul>)
      continue

    } else if (/^\d+\. /.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(<li key={i}>{renderInline(lines[i].replace(/^\d+\. /, ''))}</li>)
        i++
      }
      elements.push(<ol key={`ol-${i}`}>{items}</ol>)
      continue

    } else if (line.startsWith('| ')) {
      const rows = []
      let isFirstRow = true
      while (i < lines.length && lines[i].startsWith('| ')) {
        if (!lines[i].includes('---')) {
          const cells = lines[i].split('|').filter(c => c.trim())
          rows.push({ cells, isHeader: isFirstRow })
          isFirstRow = false
        }
        i++
      }
      elements.push(
        <div key={`table-${i}`} style={{overflowX:'auto', margin:'1.25rem 0', borderRadius:8, border:'1px solid #e5e7eb', overflow:'hidden'}}>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.875rem'}}>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{background: row.isHeader ? '#0A1F44' : ri % 2 === 1 ? '#fff' : '#f9fafb'}}>
                  {row.cells.map((c, ci) => row.isHeader
                    ? <th key={ci} style={{padding:'0.625rem 0.875rem', color:'#C9A84C', textAlign:'left', fontWeight:600, fontSize:'0.8rem'}}>{c.trim()}</th>
                    : <td key={ci} style={{padding:'0.625rem 0.875rem', borderBottom:'1px solid #f3f4f6', color:'#1f2937'}}>{renderInline(c.trim())}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue

    } else if (line.trim() === '') {
      // skip blanks
    } else {
      elements.push(<p key={i}>{renderInline(line)}</p>)
    }
    i++
  }
  return elements
}

export default function CoursePlayer() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const course = COURSES[courseId]
  const contentTopRef = useRef(null)

  const [completedChapters, setCompletedChapters] = useState([])
  const [currentChapter, setCurrentChapter] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizPassed, setQuizPassed] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !course) return
    loadProgress()
  }, [user, courseId])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentChapter])

  const loadProgress = async () => {
    const { data } = await supabase
      .from('course_progress').select('*')
      .eq('user_id', user.id).eq('course_id', courseId).single()
    if (data) {
      setCompletedChapters(data.completed_chapters || [])
      setQuizPassed(data.quiz_results || {})
      const lastCompleted = (data.completed_chapters || []).length
      setCurrentChapter(Math.min(lastCompleted, course.chapters.length - 1))
    }
    setLoading(false)
  }

  const saveProgress = async (newCompleted, newQuizResults) => {
    await supabase.from('course_progress').upsert({
      user_id: user.id, course_id: courseId,
      completed_chapters: newCompleted, quiz_results: newQuizResults,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,course_id' })
  }

  const handleQuizPass = async (chapterId) => {
    const newQuizResults = { ...quizPassed, [chapterId]: true }
    const chapter = course.chapters[currentChapter]
    const newCompleted = completedChapters.includes(chapter.id)
      ? completedChapters : [...completedChapters, chapter.id]
    setCompletedChapters(newCompleted)
    setQuizPassed(newQuizResults)
    await saveProgress(newCompleted, newQuizResults)
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 600)
  }

  const goToChapter = (idx) => { setCurrentChapter(idx); setShowQuiz(false) }
  const isChapterUnlocked = (idx) => idx === 0 || completedChapters.includes(course.chapters[idx - 1].id)
  const isChapterCompleted = (idx) => completedChapters.includes(course.chapters[idx].id)

  const progressPct = Math.round((completedChapters.length / course.chapters.length) * 100)
  const allChaptersComplete = completedChapters.length === course.chapters.length
  const chapter = course.chapters[currentChapter]

  if (!course) return <div className="main-content"><p>Course not found.</p></div>
  if (loading) return <div className="main-content"><p>Loading...</p></div>

  return (
    <div className="main-content" style={{maxWidth:1100}}>
      <div className="course-layout">
        <aside className="course-sidebar">
          <div className="sidebar-header">
            <h3>{course.title}</h3>
            <p>{course.chapters.length} chapters</p>
          </div>
          <div className="sidebar-chapters">
            {course.chapters.map((ch, idx) => {
              const unlocked = isChapterUnlocked(idx)
              const completed = isChapterCompleted(idx)
              const active = idx === currentChapter
              return (
                <div key={ch.id}
                  className={`chapter-item ${active?'active':''} ${completed?'completed':''} ${!unlocked?'locked':''}`}
                  onClick={() => { if (unlocked) goToChapter(idx) }}
                >
                  <span className="chapter-icon">{completed?'✅':!unlocked?'🔒':active?'▶':'○'}</span>
                  <span className="chapter-title">Ch. {ch.id}: {ch.title}</span>
                </div>
              )
            })}
            {allChaptersComplete && (
              <div className="chapter-item"
                style={{borderTop:'1px solid var(--gray-200)',marginTop:'0.5rem',color:'var(--gold)',fontWeight:700}}
                onClick={() => navigate(`/course/${courseId}/exam`)}>
                <span className="chapter-icon">🎓</span>
                <span className="chapter-title">Final Exam</span>
              </div>
            )}
          </div>
          <div className="sidebar-progress">
            <div className="progress-bar-label"><span>Progress</span><span>{progressPct}%</span></div>
            <div className="progress-bar"><div className="progress-bar-fill" style={{width:`${progressPct}%`}}/></div>
          </div>
        </aside>

        <div className="chapter-content" ref={contentTopRef}>
          <div className="chapter-breadcrumb">{course.title} › <span>Chapter {chapter.id}: {chapter.title}</span></div>
          <h1>{chapter.title}</h1>
          <div className="chapter-meta">
            <span>📖 {chapter.readTime} read</span>
            <span>Chapter {chapter.id} of {course.chapters.length}</span>
            {isChapterCompleted(currentChapter) && <span style={{color:'var(--green)'}}>✅ Completed</span>}
          </div>

          <div className="content-body">{renderContent(chapter.content)}</div>

          <div style={{marginTop:'1.5rem',padding:'0.75rem 1rem',background:'var(--gray-50)',borderRadius:6,border:'1px solid var(--gray-200)'}}>
            <div style={{fontSize:'0.75rem',color:'var(--gray-400)',marginBottom:'0.25rem',fontWeight:600}}>COMPLIANCE STANDARDS</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem'}}>
              {course.standards.map(s => (
                <span key={s} style={{fontSize:'0.7rem',background:'var(--navy)',color:'var(--gold)',padding:'0.2rem 0.5rem',borderRadius:3,fontWeight:600}}>{s}</span>
              ))}
            </div>
          </div>

          {!showQuiz && !isChapterCompleted(currentChapter) && (
            <div style={{marginTop:'2rem',textAlign:'center'}}>
              <p style={{color:'var(--gray-600)',marginBottom:'1rem',fontSize:'0.9rem'}}>
                You've reached the end of this chapter. Complete the quiz to unlock the next chapter.
              </p>
              <button className="btn btn-primary btn-lg" onClick={() => setShowQuiz(true)}>Take Chapter Quiz →</button>
            </div>
          )}

          {(showQuiz || isChapterCompleted(currentChapter)) && !quizPassed[chapter.id] && (
            <ChapterQuiz questions={chapter.quiz} chapterId={chapter.id} onPass={() => handleQuizPass(chapter.id)} />
          )}

          {isChapterCompleted(currentChapter) && quizPassed[chapter.id] && (
            <div className="quiz-result pass" style={{marginTop:'2rem'}}>
              <h3>✅ Chapter Complete!</h3>
              <p>You passed the quiz. Continue to the next chapter below.</p>
            </div>
          )}

          <div className="chapter-nav">
            <button className="btn btn-ghost" onClick={() => goToChapter(currentChapter-1)} disabled={currentChapter===0}>← Previous</button>
            {allChaptersComplete && currentChapter === course.chapters.length-1 ? (
              <button className="btn btn-primary" onClick={() => navigate(`/course/${courseId}/exam`)}>🎓 Take Final Exam</button>
            ) : (
              <button className="btn btn-primary"
                onClick={() => goToChapter(currentChapter+1)}
                disabled={currentChapter===course.chapters.length-1 || !isChapterCompleted(currentChapter)}>
                Next Chapter →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
