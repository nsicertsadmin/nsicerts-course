import { useState } from 'react'

export default function ChapterQuiz({ questions, chapterId, onPass }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const handleSelect = (qId, optIdx) => {
    if (submitted) return
    setAnswers(a => ({ ...a, [qId]: optIdx }))
  }

  const handleSubmit = () => {
    let correct = 0
    questions.forEach(q => {
      if (answers[q.id] === q.correct) correct++
    })
    setScore(correct)
    setSubmitted(true)
    if (correct === questions.length) onPass()
  }

  const handleRetry = () => {
    setAnswers({})
    setSubmitted(false)
    setScore(0)
  }

  const allAnswered = questions.every(q => answers[q.id] !== undefined)
  const passed = submitted && score === questions.length

  return (
    <div className="quiz-section">
      <div className="quiz-header">
        <h2>📝 Chapter Quiz</h2>
        <p>Answer all {questions.length} questions correctly to complete this chapter.</p>
      </div>

      {questions.map((q, qi) => {
        const selected = answers[q.id]
        const isCorrect = submitted && selected === q.correct
        const isWrong = submitted && selected !== undefined && selected !== q.correct

        return (
          <div className="quiz-question" key={q.id}>
            <p>{qi + 1}. {q.question}</p>
            <div className="quiz-options">
              {q.options.map((opt, oi) => {
                let cls = 'quiz-option'
                if (submitted) {
                  if (oi === q.correct) cls += ' correct'
                  else if (oi === selected && selected !== q.correct) cls += ' incorrect'
                } else if (selected === oi) {
                  cls += ' selected'
                }
                return (
                  <button
                    key={oi}
                    className={cls}
                    onClick={() => handleSelect(q.id, oi)}
                    disabled={submitted}
                  >
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      border: '2px solid currentColor',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', flexShrink: 0, fontWeight: 700
                    }}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>
            {submitted && q.explanation && (
              <div className="callout info" style={{marginTop:'0.5rem'}}>
                <div className="callout-title">💡 Explanation</div>
                {q.explanation}
              </div>
            )}
          </div>
        )
      })}

      {!submitted && (
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={!allAnswered}
          style={{marginTop:'0.5rem'}}
        >
          Submit Answers
        </button>
      )}

      {submitted && (
        <div className={`quiz-result ${passed ? 'pass' : 'fail'}`}>
          <h3>{passed ? '✅ Perfect Score!' : '❌ Not Quite'}</h3>
          <p>{passed
            ? 'You answered all questions correctly. Chapter unlocked!'
            : `You got ${score} of ${questions.length} correct. You must answer all questions correctly to proceed.`
          }</p>
          {!passed && (
            <button className="btn btn-secondary" onClick={handleRetry} style={{marginTop:'0.75rem'}}>
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  )
}
