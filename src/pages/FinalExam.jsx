import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { supabase } from '../lib/supabase'
import { MEWP_COURSE } from '../lib/mewpCourse'

const COURSES = { mewp: MEWP_COURSE }

export default function FinalExam() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const course = COURSES[courseId]

  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [alreadyPassed, setAlreadyPassed] = useState(false)
  const [certNumber, setCertNumber] = useState('')
  const [current, setCurrent] = useState(0)
  const [showReview, setShowReview] = useState(false)

  useEffect(() => { loadExamStatus() }, [user, courseId])

  const loadExamStatus = async () => {
    const { data } = await supabase
      .from('course_progress').select('passed_final, cert_number')
      .eq('user_id', user.id).eq('course_id', courseId).single()
    if (data?.passed_final) { setAlreadyPassed(true); setCertNumber(data.cert_number) }
  }

  const handleSelect = (qId, optIdx) => {
    if (submitted) return
    setAnswers(a => ({ ...a, [qId]: optIdx }))
  }

  const handleSubmit = async () => {
    let correct = 0
    course.finalExam.forEach(q => { if (answers[q.id] === q.correct) correct++ })
    const pct = Math.round((correct / course.finalExam.length) * 100)
    setScore(correct)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (pct >= course.passingScore) {
      const certNum = generateCertNumber()
      setCertNumber(certNum)
      await supabase.from('course_progress').upsert({
        user_id: user.id, course_id: courseId, passed_final: true,
        cert_number: certNum, cert_issued_at: new Date().toISOString(),
        exam_score: pct, updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,course_id' })
      await supabase.from('certifications').upsert({
        user_id: user.id, course_id: courseId, cert_number: certNum,
        issued_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        score: pct
      }, { onConflict: 'user_id,course_id' })
    }
  }

  const generateCertNumber = () => {
    const year = new Date().getFullYear()
    const rand = Math.floor(Math.random() * 900000) + 100000
    return `NSI${year}${rand}`
  }

  const handleRetry = () => {
    setAnswers({}); setSubmitted(false); setScore(0); setCurrent(0); setShowReview(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const questions = course.finalExam
  const allAnswered = questions.every(q => answers[q.id] !== undefined)
  const pct = submitted ? Math.round((score / questions.length) * 100) : 0
  const passed = submitted && pct >= course.passingScore

  // Answer review panel
  const ReviewPanel = () => (
    <div style={{marginTop:'2rem'}}>
      <h2 style={{color:'var(--navy)', marginBottom:'1.5rem', fontSize:'1.2rem'}}>📋 Answer Review</h2>
      {questions.map((q, qi) => {
        const selected = answers[q.id]
        const isCorrect = selected === q.correct
        return (
          <div key={q.id} style={{
            marginBottom:'1.25rem', padding:'1rem 1.25rem',
            borderRadius:8, border:`2px solid ${isCorrect ? '#16a34a' : '#dc2626'}`,
            background: isCorrect ? '#f0fdf4' : '#fef2f2'
          }}>
            <div style={{fontWeight:600, marginBottom:'0.5rem', fontSize:'0.9rem', color:'#1f2937'}}>
              {qi + 1}. {q.question}
            </div>
            <div style={{fontSize:'0.85rem', marginBottom:'0.375rem'}}>
              <span style={{color:'#6b7280'}}>Your answer: </span>
              <span style={{color: isCorrect ? '#16a34a' : '#dc2626', fontWeight:600}}>
                {isCorrect ? '✅ ' : '❌ '}{q.options[selected]}
              </span>
            </div>
            {!isCorrect && (
              <div style={{fontSize:'0.85rem', marginBottom:'0.375rem'}}>
                <span style={{color:'#6b7280'}}>Correct answer: </span>
                <span style={{color:'#16a34a', fontWeight:600}}>✅ {q.options[q.correct]}</span>
              </div>
            )}
            {q.explanation && (
              <div style={{
                marginTop:'0.5rem', padding:'0.5rem 0.75rem',
                background:'white', borderRadius:6, fontSize:'0.83rem', color:'#374151',
                borderLeft:'3px solid #C9A84C'
              }}>
                💡 {q.explanation}
              </div>
            )}
          </div>
        )
      })}
      <div style={{textAlign:'center', marginTop:'1.5rem', display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap'}}>
        {!passed && <button className="btn btn-primary btn-lg" onClick={handleRetry}>Retake Exam</button>}
        {passed && <button className="btn btn-primary btn-lg" onClick={() => navigate(`/certificate/${courseId}`)}>View Certificate →</button>}
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>← Dashboard</button>
      </div>
    </div>
  )

  if (alreadyPassed) {
    return (
      <div className="main-content">
        <div style={{maxWidth:700, margin:'0 auto', textAlign:'center', padding:'2rem 0'}}>
          <div style={{width:120,height:120,borderRadius:'50%',background:'#f0fdf4',border:'4px solid #16a34a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem'}}>
            <span style={{fontSize:'2.5rem'}}>✅</span>
          </div>
          <h1 style={{color:'var(--navy)', marginBottom:'0.5rem'}}>Certification Complete!</h1>
          <p style={{color:'var(--gray-600)', marginBottom:'1.5rem'}}>You have already passed this exam.</p>
          <div style={{background:'var(--gray-50)',border:'1px solid var(--gray-200)',borderRadius:8,padding:'1rem',marginBottom:'1.5rem',fontSize:'0.9rem'}}>
            <strong>Certificate Number:</strong> {certNumber}
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate(`/certificate/${courseId}`)}>View Certificate →</button>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content">
      <div style={{maxWidth:700, margin:'0 auto'}}>
        <div style={{textAlign:'center', marginBottom:'2rem'}}>
          <h1 style={{fontSize:'1.75rem', fontWeight:700, color:'var(--navy)'}}>🎓 Final Certification Exam</h1>
          <p style={{color:'var(--gray-600)'}}>{course.title}</p>
          <p style={{fontSize:'0.875rem', color:'var(--gray-400)', marginTop:'0.25rem'}}>
            {questions.length} questions · {course.passingScore}% to pass ({Math.ceil(questions.length * course.passingScore / 100)}/{questions.length} correct required)
          </p>
          {!submitted && (
            <div style={{display:'flex', justifyContent:'center', gap:'0.375rem', margin:'1rem 0', flexWrap:'wrap'}}>
              {questions.map((q, i) => (
                <div key={q.id} style={{
                  width:10, height:10, borderRadius:'50%',
                  background: i === current ? '#C9A84C' : answers[q.id] !== undefined ? '#0A1F44' : '#e5e7eb'
                }}/>
              ))}
            </div>
          )}
        </div>

        {/* Score card shown after submit */}
        {submitted && (
          <div style={{textAlign:'center', marginBottom:'2rem'}}>
            <div style={{
              width:140, height:140, borderRadius:'50%',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              margin:'0 auto 1.25rem',
              border:`4px solid ${passed ? '#16a34a' : '#dc2626'}`,
              background: passed ? '#f0fdf4' : '#fef2f2'
            }}>
              <span style={{fontSize:'2.25rem', fontWeight:700, color: passed ? '#16a34a' : '#dc2626', lineHeight:1}}>{pct}%</span>
              <span style={{fontSize:'0.75rem', color: passed ? '#16a34a' : '#dc2626'}}>{score}/{questions.length} correct</span>
            </div>
            <h2 style={{color: passed ? '#16a34a' : '#dc2626', marginBottom:'0.5rem'}}>
              {passed ? '🎉 You Passed!' : '❌ Not Quite'}
            </h2>
            <p style={{color:'var(--gray-600)', marginBottom:'1.5rem'}}>
              {passed
                ? `Congratulations! You scored ${pct}% on the ${course.title} exam.`
                : `You scored ${pct}%. You need ${course.passingScore}% to pass. Review your answers below and try again.`
              }
            </p>
            {passed && (
              <div style={{background:'var(--gray-50)',border:'1px solid var(--gray-200)',borderRadius:8,padding:'1rem',marginBottom:'1rem',fontSize:'0.9rem'}}>
                <div style={{fontSize:'0.75rem',color:'var(--gray-400)',marginBottom:'0.25rem'}}>CERTIFICATE NUMBER</div>
                <strong style={{fontSize:'1.1rem',color:'var(--navy)'}}>{certNumber}</strong>
              </div>
            )}
            <div style={{display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap', marginBottom:'1rem'}}>
              {passed && <button className="btn btn-primary btn-lg" onClick={() => navigate(`/certificate/${courseId}`)}>View Certificate →</button>}
              <button className="btn btn-ghost" onClick={() => setShowReview(r => !r)}>
                {showReview ? 'Hide' : 'Review'} Answer Explanations
              </button>
              {!passed && <button className="btn btn-secondary" onClick={handleRetry}>Retake Exam</button>}
            </div>
          </div>
        )}

        {/* Answer review */}
        {submitted && showReview && <ReviewPanel />}

        {/* Question card */}
        {!submitted && (
          <div className="card">
            <div style={{marginBottom:'1.5rem'}}>
              <div style={{fontSize:'0.75rem',color:'var(--gray-400)',marginBottom:'0.5rem',fontWeight:500}}>
                Question {current + 1} of {questions.length}
              </div>
              <p style={{fontWeight:600, fontSize:'1rem', color:'var(--gray-800)', lineHeight:1.6}}>
                {questions[current].question}
              </p>
            </div>
            <div className="quiz-options">
              {questions[current].options.map((opt, oi) => (
                <button key={oi}
                  className={`quiz-option ${answers[questions[current].id] === oi ? 'selected' : ''}`}
                  onClick={() => handleSelect(questions[current].id, oi)}
                >
                  <span style={{width:22,height:22,borderRadius:'50%',border:'2px solid currentColor',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',flexShrink:0,fontWeight:700}}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:'1.5rem',alignItems:'center'}}>
              <button className="btn btn-ghost" onClick={() => setCurrent(c => c-1)} disabled={current===0}>← Back</button>
              <span style={{fontSize:'0.8rem',color:'var(--gray-400)'}}>{Object.keys(answers).length}/{questions.length} answered</span>
              {current < questions.length-1
                ? <button className="btn btn-primary" onClick={() => setCurrent(c => c+1)}>Next →</button>
                : <button className="btn btn-primary" onClick={handleSubmit} disabled={!allAnswered}>Submit Exam</button>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
