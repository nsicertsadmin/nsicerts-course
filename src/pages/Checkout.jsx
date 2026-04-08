import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { supabase } from '../lib/supabase'

const COURSES = {
  mewp:    { name: 'MEWP Operator Safety Certification', price: 39, icon: '🏗️', duration: '60–90 min', chapters: 8 },
  forklift:{ name: 'Forklift Operator Certification',    price: 39, icon: '🚜', duration: '60–90 min', chapters: 8 },
  fall:    { name: 'Fall Protection Training',           price: 29, icon: '🦺', duration: '45–60 min', chapters: 6 },
  hazcom:  { name: 'Hazard Communication (HazCom)',      price: 19, icon: '⚗️', duration: '30–45 min', chapters: 5 },
}

export default function Checkout() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const cloverRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [alreadyPaid, setAlreadyPaid] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)

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

    if (data?.paid) { setAlreadyPaid(true); setLoading(false); return }
    setLoading(false)
    loadClover()
  }

  const loadClover = () => {
    if (document.getElementById('clover-sdk')) { initClover(); return }
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

      const inputStyles = {
        body: { fontFamily: 'DM Sans, sans-serif', fontSize: '15px' },
        input: {
          fontSize: '15px', color: '#0B1629',
          backgroundColor: '#ffffff', padding: '12px 14px',
          border: 'none', outline: 'none', width: '100%',
        },
      }

      const cardNumber = elements.create('CARD_NUMBER', inputStyles)
      const cardDate   = elements.create('CARD_DATE',   inputStyles)
      const cardCvv    = elements.create('CARD_CVV',    inputStyles)
      const cardPostal = elements.create('CARD_POSTAL_CODE', inputStyles)

      cardNumber.mount('#card-number')
      cardDate.mount('#card-date')
      cardCvv.mount('#card-cvv')
      cardPostal.mount('#card-postal')

      cardNumber.addEventListener('change', e => {
        setError(e.CARD_NUMBER?.error || '')
      })

      setSdkReady(true)
    } catch (err) {
      setError('Payment form error. Please refresh and try again.')
    }
  }

  const handlePay = async () => {
    if (!cloverRef.current || processing) return
    setProcessing(true)
    setError('')

    try {
      const result = await cloverRef.current.createToken()
      if (result.errors) {
        setError(Object.values(result.errors)[0])
        setProcessing(false)
        return
      }

      const res = await fetch('/api/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: result.token,
          courseId,
          userId: user.id,
          email: user.email,
          amount: course.price * 100,
          description: `NSI ${course.name}`,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Payment failed. Please try again.')
        setProcessing(false)
        return
      }

      await supabase.from('course_progress').upsert({
        user_id: user.id, course_id: courseId,
        paid: true, paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,course_id' })

      navigate(`/course/${courseId}`)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setProcessing(false)
    }
  }

  if (!course) return <div className="main-content"><p>Course not found.</p></div>
  if (loading)  return <div className="main-content" style={{textAlign:'center',paddingTop:'4rem'}}><p>Loading...</p></div>

  if (alreadyPaid) return (
    <div className="main-content">
      <div style={{maxWidth:480,margin:'0 auto',textAlign:'center',paddingTop:'3rem'}}>
        <div style={{fontSize:'3.5rem',marginBottom:'1rem'}}>✅</div>
        <h2 style={{color:'var(--navy)',marginBottom:'0.5rem'}}>Already Enrolled</h2>
        <p style={{color:'var(--gray-600)',marginBottom:'1.5rem'}}>You already have access to this course.</p>
        <button className="btn btn-primary" onClick={() => navigate(`/course/${courseId}`)}>Go to Course →</button>
      </div>
    </div>
  )

  return (
    <div style={{background:'#f1f5f9',minHeight:'100vh',paddingTop:'2rem',paddingBottom:'4rem'}}>
      <div style={{maxWidth:960,margin:'0 auto',padding:'0 1.5rem'}}>

        {/* Header */}
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'white',border:'1px solid #e2e8f0',borderRadius:8,padding:'0.5rem 1rem',marginBottom:'1rem'}}>
            <span style={{color:'#16a34a',fontSize:'0.8rem'}}>🔒</span>
            <span style={{fontSize:'0.8rem',color:'#374151',fontFamily:'sans-serif'}}>Secure Checkout — 256-bit SSL Encryption</span>
          </div>
          <h1 style={{fontSize:'1.6rem',color:'#0B1629',fontFamily:'sans-serif',fontWeight:700}}>Complete Your Enrollment</h1>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:'1.5rem',alignItems:'start'}}>

          {/* LEFT — Payment Form */}
          <div>
            {/* Order Summary */}
            <div style={{background:'white',borderRadius:12,border:'1px solid #e2e8f0',padding:'1.5rem',marginBottom:'1.5rem'}}>
              <h3 style={{fontSize:'0.85rem',fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:1,marginBottom:'1rem',fontFamily:'sans-serif'}}>Order Summary</h3>
              <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                <div style={{width:52,height:52,background:'#f0fdf4',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',flexShrink:0}}>{course.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,color:'#0B1629',fontSize:'0.95rem',fontFamily:'sans-serif'}}>{course.name}</div>
                  <div style={{fontSize:'0.78rem',color:'#6b7280',marginTop:'0.2rem',fontFamily:'sans-serif'}}>
                    {course.duration} · {course.chapters} chapters · Instant certificate · 3-year validity
                  </div>
                </div>
                <div style={{fontWeight:800,fontSize:'1.4rem',color:'#0B1629',fontFamily:'sans-serif'}}>${course.price}</div>
              </div>
              <div style={{borderTop:'1px solid #f1f5f9',marginTop:'1rem',paddingTop:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:'0.85rem',color:'#6b7280',fontFamily:'sans-serif'}}>Total due today</span>
                <span style={{fontWeight:800,fontSize:'1.2rem',color:'#0B1629',fontFamily:'sans-serif'}}>${course.price}.00</span>
              </div>
            </div>

            {/* Card Form */}
            <div style={{background:'white',borderRadius:12,border:'1px solid #e2e8f0',padding:'1.5rem'}}>
              <h3 style={{fontSize:'0.85rem',fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:1,marginBottom:'1.25rem',fontFamily:'sans-serif'}}>Payment Information</h3>

              {error && (
                <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'0.75rem 1rem',marginBottom:'1rem',color:'#dc2626',fontSize:'0.85rem',fontFamily:'sans-serif'}}>
                  ⚠️ {error}
                </div>
              )}

              {/* Card Number */}
              <div style={{marginBottom:'1rem'}}>
                <label style={labelStyle}>Card Number</label>
                <div style={fieldWrap}>
                  <div id="card-number" style={{flex:1,minHeight:20}} />
                  <div style={{display:'flex',gap:'4px',alignItems:'center',paddingRight:8}}>
                    {['visa','mc','amex'].map(b => (
                      <div key={b} style={{width:32,height:20,background:'#f1f5f9',borderRadius:3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'7px',fontWeight:700,color:'#6b7280',fontFamily:'monospace'}}>
                        {b === 'visa' ? 'VISA' : b === 'mc' ? 'MC' : 'AMEX'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expiry + CVV */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                <div>
                  <label style={labelStyle}>Expiration Date</label>
                  <div style={fieldWrap}><div id="card-date" style={{flex:1,minHeight:20}} /></div>
                </div>
                <div>
                  <label style={labelStyle}>
                    CVV
                    <span style={{marginLeft:6,color:'#9ca3af',cursor:'help'}} title="3-digit code on back of card">ⓘ</span>
                  </label>
                  <div style={fieldWrap}><div id="card-cvv" style={{flex:1,minHeight:20}} /></div>
                </div>
              </div>

              {/* ZIP */}
              <div style={{marginBottom:'1.5rem'}}>
                <label style={labelStyle}>Billing ZIP Code</label>
                <div style={fieldWrap}><div id="card-postal" style={{flex:1,minHeight:20}} /></div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePay}
                disabled={processing || !sdkReady}
                style={{
                  width:'100%', padding:'14px',
                  background: processing ? '#9ca3af' : '#0B1629',
                  color:'white', border:'none', borderRadius:8,
                  fontSize:'1rem', fontWeight:700, cursor: processing ? 'not-allowed' : 'pointer',
                  fontFamily:'sans-serif', transition:'background 0.2s',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem'
                }}
              >
                {processing ? (
                  <>⏳ Processing payment...</>
                ) : (
                  <>🔒 Pay ${course.price}.00 — Enroll Now</>
                )}
              </button>

              {/* Security note */}
              <div style={{marginTop:'1rem',textAlign:'center',fontSize:'0.75rem',color:'#9ca3af',fontFamily:'sans-serif',lineHeight:1.5}}>
                Your payment is processed securely by Clover.<br/>
                Card details are encrypted and never stored on our servers.
              </div>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              style={{marginTop:'1rem',background:'none',border:'none',color:'#6b7280',cursor:'pointer',fontSize:'0.85rem',fontFamily:'sans-serif'}}
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* RIGHT — Trust sidebar */}
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>

            {/* What you get */}
            <div style={{background:'white',borderRadius:12,border:'1px solid #e2e8f0',padding:'1.25rem'}}>
              <h3 style={{fontSize:'0.85rem',fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:1,marginBottom:'1rem',fontFamily:'sans-serif'}}>What You Get</h3>
              {[
                ['✅', 'Instant course access after payment'],
                ['📜', 'Downloadable PDF certificate on completion'],
                ['🔒', 'OSHA · ANSI · CSA compliant training'],
                ['🔁', 'Unlimited quiz retakes included'],
                ['📅', '3-year certification validity'],
                ['📱', 'Works on any device, any time'],
              ].map(([icon, text]) => (
                <div key={text} style={{display:'flex',gap:'0.6rem',alignItems:'flex-start',marginBottom:'0.6rem',fontFamily:'sans-serif',fontSize:'0.83rem',color:'#374151'}}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>

            {/* Compliance badges */}
            <div style={{background:'#0B1629',borderRadius:12,padding:'1.25rem'}}>
              <h3 style={{fontSize:'0.75rem',fontWeight:700,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:1,marginBottom:'0.75rem',fontFamily:'sans-serif'}}>Compliance Standards</h3>
              {[
                ['OSHA', '29 CFR 1926.453', '#ef4444'],
                ['ANSI', 'A92.22 & A92.24', '#F5A623'],
                ['CSA',  'B354.6:17',       '#22c55e'],
              ].map(([label, sub, color]) => (
                <div key={label} style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.6rem'}}>
                  <div style={{width:36,height:36,borderRadius:6,background:`${color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'10px',color,fontFamily:'monospace',flexShrink:0}}>{label}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:'0.8rem',color:'white',fontFamily:'sans-serif'}}>{label} Compliant</div>
                    <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)',fontFamily:'sans-serif'}}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Money back */}
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:'1.25rem',textAlign:'center'}}>
              <div style={{fontSize:'1.75rem',marginBottom:'0.4rem'}}>💚</div>
              <div style={{fontWeight:700,fontSize:'0.9rem',color:'#16a34a',fontFamily:'sans-serif'}}>Satisfaction Guaranteed</div>
              <div style={{fontSize:'0.78rem',color:'#374151',marginTop:'0.25rem',fontFamily:'sans-serif',lineHeight:1.5}}>
                If you're not satisfied, contact us within 7 days for a full refund.
              </div>
            </div>

            {/* Contact */}
            <div style={{textAlign:'center',fontSize:'0.78rem',color:'#6b7280',fontFamily:'sans-serif'}}>
              Questions? <a href="mailto:NSIcertsadmin@gmail.com" style={{color:'#0B1629',fontWeight:600}}>NSIcertsadmin@gmail.com</a>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: '0.8rem', fontWeight: 600,
  color: '#374151', marginBottom: '0.4rem', fontFamily: 'sans-serif',
}

const fieldWrap = {
  border: '1.5px solid #d1d5db', borderRadius: 8, padding: '10px 14px',
  background: '#ffffff', display: 'flex', alignItems: 'center',
  minHeight: 46, transition: 'border-color 0.2s',
}
