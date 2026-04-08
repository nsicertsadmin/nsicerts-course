import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { supabase } from '../lib/supabase'

const COURSES = {
  mewp: { name: 'MEWP Operator Safety Certification', price: 39, icon: '🏗️' },
  forklift: { name: 'Forklift Operator Certification', price: 39, icon: '🚜' },
  fall: { name: 'Fall Protection Training', price: 29, icon: '🦺' },
  hazcom: { name: 'Hazard Communication (HazCom)', price: 19, icon: '⚗️' },
}

export default function Checkout() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const iframeRef = useRef(null)
  const cloverRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [cardReady, setCardReady] = useState(false)
  const [alreadyPaid, setAlreadyPaid] = useState(false)

  const course = COURSES[courseId]
  const MID = import.meta.env.VITE_CLOVER_MID
  const PUBLIC_TOKEN = import.meta.env.VITE_CLOVER_PUBLIC_TOKEN

  useEffect(() => {
    checkAlreadyPurchased()
  }, [user, courseId])

  const checkAlreadyPurchased = async () => {
    const { data } = await supabase
      .from('course_progress')
      .select('paid')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (data?.paid) {
      setAlreadyPaid(true)
      setLoading(false)
      return
    }
    setLoading(false)
    loadClover()
  }

  const loadClover = () => {
    if (document.getElementById('clover-sdk')) {
      initClover()
      return
    }
    const script = document.createElement('script')
    script.id = 'clover-sdk'
    script.src = 'https://checkout.clover.com/sdk.js'
    script.onload = initClover
    script.onerror = () => setError('Failed to load payment form. Please refresh.')
    document.head.appendChild(script)
  }

  const initClover = () => {
    try {
      const clover = new window.Clover(PUBLIC_TOKEN, { merchantId: MID })
      cloverRef.current = clover

      const elements = clover.elements()
      const styles = {
        body: { fontFamily: 'DM Sans, sans-serif' },
        input: {
          fontSize: '15px',
          color: '#0B1629',
          backgroundColor: '#ffffff',
          padding: '10px 14px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
        },
      }

      const cardNumber = elements.create('CARD_NUMBER', styles)
      const cardDate = elements.create('CARD_DATE', styles)
      const cardCvv = elements.create('CARD_CVV', styles)
      const cardPostal = elements.create('CARD_POSTAL_CODE', styles)

      cardNumber.mount('#card-number')
      cardDate.mount('#card-date')
      cardCvv.mount('#card-cvv')
      cardPostal.mount('#card-postal')

      cardNumber.addEventListener('change', (e) => {
        if (e.CARD_NUMBER?.error) setError(e.CARD_NUMBER.error)
        else setError('')
        setCardReady(!!e.CARD_NUMBER?.touched)
      })

      setCardReady(true)
    } catch (err) {
      setError('Payment form error: ' + err.message)
    }
  }

  const handlePay = async () => {
    if (!cloverRef.current) return
    setProcessing(true)
    setError('')

    try {
      // 1. Tokenize card via Clover iFrame
      const result = await cloverRef.current.createToken()
      if (result.errors) {
        const msg = Object.values(result.errors)[0]
        setError(msg)
        setProcessing(false)
        return
      }

      const token = result.token

      // 2. Send token to our server-side function to charge
      const res = await fetch('/api/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          courseId,
          userId: user.id,
          email: user.email,
          amount: course.price * 100, // cents
          description: `NSI ${course.name}`,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Payment failed. Please try again.')
        setProcessing(false)
        return
      }

      // 3. Mark course as paid in Supabase
      await supabase.from('course_progress').upsert({
        user_id: user.id,
        course_id: courseId,
        paid: true,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,course_id' })

      // 4. Redirect to course
      navigate(`/course/${courseId}`)

    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setProcessing(false)
    }
  }

  if (!course) return (
    <div className="main-content">
      <p>Course not found.</p>
    </div>
  )

  if (loading) return (
    <div className="main-content" style={{ textAlign: 'center' }}>
      <p>Loading...</p>
    </div>
  )

  if (alreadyPaid) return (
    <div className="main-content">
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ color: 'var(--navy)', marginBottom: '0.5rem' }}>Already Enrolled</h2>
        <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>You already have access to this course.</p>
        <button className="btn btn-primary" onClick={() => navigate(`/course/${courseId}`)}>
          Go to Course →
        </button>
      </div>
    </div>
  )

  return (
    <div className="main-content">
      <div style={{ maxWidth: 520, margin: '0 auto' }}>

        {/* Course summary */}
        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <div style={{ fontSize: '2.5rem' }}>{course.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.95rem' }}>{course.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.2rem' }}>
              Full course + certificate · 3-year validity
            </div>
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--navy)' }}>
            ${course.price}
          </div>
        </div>

        {/* Payment form */}
        <div className="card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--navy)' }}>
            💳 Payment Details
          </h2>

          {error && (
            <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Card Number</label>
              <div id="card-number" style={fieldStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Expiration Date</label>
                <div id="card-date" style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>CVV</label>
                <div id="card-cvv" style={fieldStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>ZIP Code</label>
              <div id="card-postal" style={fieldStyle} />
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1.5rem', fontSize: '1rem' }}
            onClick={handlePay}
            disabled={processing}
          >
            {processing ? '⏳ Processing...' : `Pay $${course.price} — Enroll Now`}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--gray-400)' }}>
            <span>🔒</span>
            <span>Secured by Clover · Your card data is encrypted and never stored on our servers</span>
          </div>
        </div>

        <button
          className="btn btn-ghost"
          style={{ marginTop: '1rem' }}
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '0.4rem',
  fontFamily: 'sans-serif',
}

const fieldStyle = {
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  padding: '2px',
  minHeight: '44px',
  background: '#fff',
}
