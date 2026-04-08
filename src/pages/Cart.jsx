import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { supabase } from '../lib/supabase'

const ALL_COURSES = {
  mewp:     { name: 'MEWP Operator Safety Certification', price: 39, icon: '🏗️', duration: '60–90 min' },
  forklift: { name: 'Forklift Operator Certification',    price: 39, icon: '🚜', duration: '60–90 min' },
  fall:     { name: 'Fall Protection Training',           price: 29, icon: '🦺', duration: '45–60 min' },
  hazcom:   { name: 'Hazard Communication (HazCom)',      price: 19, icon: '⚗️', duration: '30–45 min' },
}

export default function Cart() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const cloverRef = useRef(null)

  const [cart, setCart] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('nsi_cart') || '[]') } catch { return [] }
  })
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(null)
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [sdkReady, setSdkReady] = useState(false)
  const [sdkError, setSdkError] = useState('')

  const MID = import.meta.env.VITE_CLOVER_MID
  const PUBLIC_TOKEN = import.meta.env.VITE_CLOVER_PUBLIC_TOKEN

  const subtotal = cart.reduce((sum, id) => sum + (ALL_COURSES[id]?.price || 0), 0)
  const discount = promoApplied ? Math.round(subtotal * (promoApplied.discount_pct / 100)) : 0
  const total = subtotal - discount

  useEffect(() => {
    if (cart.length > 0) loadCloverSDK()
  }, [cart])

  useEffect(() => {
    sessionStorage.setItem('nsi_cart', JSON.stringify(cart))
  }, [cart])

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c !== id))

  const applyPromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError('')
    setPromoApplied(null)

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.trim().toUpperCase())
      .eq('active', true)
      .single()

    setPromoLoading(false)

    if (error || !data) {
      setPromoError('Invalid or expired promo code.')
      return
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setPromoError('This promo code has expired.')
      return
    }

    setPromoApplied(data)
  }

  const removePromo = () => {
    setPromoApplied(null)
    setPromoCode('')
    setPromoError('')
  }

  const loadCloverSDK = () => {
    if (document.getElementById('clover-sdk')) { initClover(); return }
    const script = document.createElement('script')
    script.id = 'clover-sdk'
    script.src = 'https://checkout.clover.com/sdk.js'
    script.onload = initClover
    script.onerror = () => setSdkError('Failed to load payment form. Please refresh.')
    document.head.appendChild(script)
  }

  const initClover = () => {
    // Wait for DOM to be ready
    setTimeout(() => {
      try {
        const clover = new window.Clover(PUBLIC_TOKEN, { merchantId: MID })
        cloverRef.current = clover
        const elements = clover.elements()
        const inputStyles = {
          body: { fontFamily: 'DM Sans, sans-serif' },
          input: { fontSize: '15px', color: '#0B1629', backgroundColor: '#ffffff', padding: '12px 14px', border: 'none', outline: 'none' },
        }
        elements.create('CARD_NUMBER', inputStyles).mount('#card-number')
        elements.create('CARD_DATE',   inputStyles).mount('#card-date')
        elements.create('CARD_CVV',    inputStyles).mount('#card-cvv')
        elements.create('CARD_POSTAL_CODE', inputStyles).mount('#card-postal')
        setSdkReady(true)
      } catch (err) {
        setSdkError('Payment form error. Please refresh.')
      }
    }, 400)
  }

  const handlePay = async () => {
    if (!cloverRef.current || processing || cart.length === 0) return
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
          courseIds: cart,
          userId: user.id,
          email: user.email,
          amount: total * 100,
          promoCode: promoApplied?.code || null,
          description: `NSI Courses: ${cart.map(id => ALL_COURSES[id]?.name).join(', ')}`,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Payment failed. Please try again.')
        setProcessing(false)
        return
      }

      // Mark all courses as paid in Supabase
      for (const courseId of cart) {
        await supabase.from('course_progress').upsert({
          user_id: user.id, course_id: courseId,
          paid: true, paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,course_id' })
      }

      // Clear cart
      sessionStorage.removeItem('nsi_cart')
      navigate('/dashboard?enrolled=true')

    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setProcessing(false)
    }
  }

  if (cart.length === 0) return (
    <div style={pageWrap}>
      <div style={{maxWidth:520,margin:'0 auto',textAlign:'center',paddingTop:'4rem'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🛒</div>
        <h2 style={{color:'#0B1629',fontFamily:'sans-serif',marginBottom:'0.5rem'}}>Your cart is empty</h2>
        <p style={{color:'#6b7280',fontFamily:'sans-serif',marginBottom:'1.5rem'}}>Add courses from the dashboard to get started.</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Browse Courses →</button>
      </div>
    </div>
  )

  return (
    <div style={pageWrap}>
      <div style={{maxWidth:1000,margin:'0 auto',padding:'0 1.5rem'}}>

        {/* Header */}
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'white',border:'1px solid #e2e8f0',borderRadius:8,padding:'0.5rem 1rem',marginBottom:'1rem'}}>
            <span style={{fontSize:'0.8rem'}}>🔒</span>
            <span style={{fontSize:'0.8rem',color:'#374151',fontFamily:'sans-serif'}}>Secure Checkout — 256-bit SSL Encryption</span>
          </div>
          <h1 style={{fontSize:'1.6rem',color:'#0B1629',fontFamily:'sans-serif',fontWeight:700}}>Your Cart</h1>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:'1.5rem',alignItems:'start'}}>

          {/* LEFT */}
          <div>
            {/* Cart items */}
            <div style={card}>
              <h3 style={sectionLabel}>Courses ({cart.length})</h3>
              {cart.map(id => {
                const c = ALL_COURSES[id]
                if (!c) return null
                return (
                  <div key={id} style={{display:'flex',alignItems:'center',gap:'1rem',paddingBottom:'1rem',marginBottom:'1rem',borderBottom:'1px solid #f1f5f9'}}>
                    <div style={{width:48,height:48,background:'#f0fdf4',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',flexShrink:0}}>{c.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:'#0B1629',fontSize:'0.9rem',fontFamily:'sans-serif'}}>{c.name}</div>
                      <div style={{fontSize:'0.75rem',color:'#6b7280',fontFamily:'sans-serif'}}>{c.duration} · Instant certificate · 3-year validity</div>
                    </div>
                    <div style={{fontWeight:700,color:'#0B1629',fontFamily:'sans-serif'}}>${c.price}</div>
                    <button onClick={() => removeFromCart(id)} style={{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'1.2rem',padding:'0 0.25rem'}} title="Remove">×</button>
                  </div>
                )
              })}

              {/* Promo code */}
              <div style={{marginTop:'0.5rem'}}>
                <h3 style={{...sectionLabel, marginBottom:'0.75rem'}}>Promo Code</h3>
                {promoApplied ? (
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,padding:'0.75rem 1rem'}}>
                    <span style={{fontSize:'1rem'}}>✅</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:'#16a34a',fontSize:'0.85rem',fontFamily:'sans-serif'}}>{promoApplied.code} applied — {promoApplied.discount_pct}% off!</div>
                      <div style={{fontSize:'0.75rem',color:'#374151',fontFamily:'sans-serif'}}>{promoApplied.description || ''}</div>
                    </div>
                    <button onClick={removePromo} style={{background:'none',border:'none',color:'#6b7280',cursor:'pointer',fontSize:'0.8rem',fontFamily:'sans-serif',textDecoration:'underline'}}>Remove</button>
                  </div>
                ) : (
                  <div style={{display:'flex',gap:'0.75rem'}}>
                    <input
                      value={promoCode}
                      onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError('') }}
                      onKeyDown={e => e.key === 'Enter' && applyPromo()}
                      placeholder="Enter promo code"
                      style={{flex:1,border:'1.5px solid #d1d5db',borderRadius:8,padding:'10px 14px',fontSize:'0.9rem',fontFamily:'sans-serif',outline:'none',textTransform:'uppercase'}}
                    />
                    <button
                      onClick={applyPromo}
                      disabled={promoLoading || !promoCode.trim()}
                      style={{background:'#0B1629',color:'white',border:'none',borderRadius:8,padding:'10px 20px',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',fontFamily:'sans-serif',whiteSpace:'nowrap'}}
                    >
                      {promoLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                )}
                {promoError && <div style={{color:'#dc2626',fontSize:'0.8rem',marginTop:'0.5rem',fontFamily:'sans-serif'}}>⚠️ {promoError}</div>}
              </div>
            </div>

            {/* Payment form */}
            <div style={card}>
              <h3 style={sectionLabel}>Payment Information</h3>

              {(error || sdkError) && (
                <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'0.75rem 1rem',marginBottom:'1rem',color:'#dc2626',fontSize:'0.85rem',fontFamily:'sans-serif'}}>
                  ⚠️ {error || sdkError}
                </div>
              )}

              <div style={{marginBottom:'1rem'}}>
                <label style={labelStyle}>Card Number</label>
                <div style={fieldWrap}>
                  <div id="card-number" style={{flex:1,minHeight:20}} />
                  <div style={{display:'flex',gap:4,paddingRight:4}}>
                    {['VISA','MC','AMEX'].map(b => (
                      <div key={b} style={{width:32,height:20,background:'#f1f5f9',borderRadius:3,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'7px',fontWeight:700,color:'#6b7280',fontFamily:'monospace'}}>{b}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                <div>
                  <label style={labelStyle}>Expiration Date</label>
                  <div style={fieldWrap}><div id="card-date" style={{flex:1,minHeight:20}} /></div>
                </div>
                <div>
                  <label style={labelStyle}>CVV</label>
                  <div style={fieldWrap}><div id="card-cvv" style={{flex:1,minHeight:20}} /></div>
                </div>
              </div>

              <div style={{marginBottom:'1.5rem'}}>
                <label style={labelStyle}>Billing ZIP Code</label>
                <div style={fieldWrap}><div id="card-postal" style={{flex:1,minHeight:20}} /></div>
              </div>

              <button
                onClick={handlePay}
                disabled={processing || !sdkReady}
                style={{width:'100%',padding:'14px',background:processing?'#9ca3af':'#0B1629',color:'white',border:'none',borderRadius:8,fontSize:'1rem',fontWeight:700,cursor:processing?'not-allowed':'pointer',fontFamily:'sans-serif',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}
              >
                {processing ? '⏳ Processing...' : `🔒 Pay $${total}.00 — Enroll Now`}
              </button>

              <div style={{marginTop:'1rem',textAlign:'center',fontSize:'0.75rem',color:'#9ca3af',fontFamily:'sans-serif',lineHeight:1.5}}>
                Secured by Clover · Card details encrypted · Never stored on our servers
              </div>
            </div>

            <button onClick={() => navigate('/dashboard')} style={{background:'none',border:'none',color:'#6b7280',cursor:'pointer',fontSize:'0.85rem',fontFamily:'sans-serif',marginTop:'0.5rem'}}>
              ← Back to Dashboard
            </button>
          </div>

          {/* RIGHT — Order summary + trust */}
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>

            {/* Price breakdown */}
            <div style={card}>
              <h3 style={sectionLabel}>Order Summary</h3>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem',fontFamily:'sans-serif',fontSize:'0.9rem'}}>
                <span style={{color:'#6b7280'}}>Subtotal ({cart.length} course{cart.length>1?'s':''})</span>
                <span style={{color:'#0B1629'}}>${subtotal}.00</span>
              </div>
              {promoApplied && (
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem',fontFamily:'sans-serif',fontSize:'0.9rem'}}>
                  <span style={{color:'#16a34a'}}>Promo ({promoApplied.code})</span>
                  <span style={{color:'#16a34a'}}>−${discount}.00</span>
                </div>
              )}
              <div style={{borderTop:'1px solid #e2e8f0',marginTop:'0.75rem',paddingTop:'0.75rem',display:'flex',justifyContent:'space-between',fontFamily:'sans-serif'}}>
                <span style={{fontWeight:700,color:'#0B1629'}}>Total</span>
                <span style={{fontWeight:800,fontSize:'1.2rem',color:'#0B1629'}}>${total}.00</span>
              </div>
            </div>

            {/* What you get */}
            <div style={card}>
              <h3 style={sectionLabel}>What You Get</h3>
              {[
                ['✅','Instant course access'],
                ['📜','PDF certificate on completion'],
                ['🔒','OSHA · ANSI · CSA compliant'],
                ['🔁','Unlimited quiz retakes'],
                ['📅','3-year certification validity'],
                ['📱','Any device, any time'],
              ].map(([icon,text]) => (
                <div key={text} style={{display:'flex',gap:'0.6rem',alignItems:'center',marginBottom:'0.5rem',fontFamily:'sans-serif',fontSize:'0.82rem',color:'#374151'}}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>

            {/* Compliance */}
            <div style={{background:'#0B1629',borderRadius:12,padding:'1.25rem'}}>
              <h3 style={{fontSize:'0.75rem',fontWeight:700,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:1,marginBottom:'0.75rem',fontFamily:'sans-serif'}}>Compliance Standards</h3>
              {[['OSHA','29 CFR 1926.453','#ef4444'],['ANSI','A92.22 & A92.24','#F5A623'],['CSA','B354.6:17','#22c55e']].map(([label,sub,color]) => (
                <div key={label} style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'0.5rem'}}>
                  <div style={{width:32,height:32,borderRadius:6,background:`${color}22`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'9px',color,fontFamily:'monospace',flexShrink:0}}>{label}</div>
                  <div style={{fontWeight:600,fontSize:'0.78rem',color:'white',fontFamily:'sans-serif'}}>{label} Compliant <span style={{color:'rgba(255,255,255,0.4)',fontWeight:400}}>· {sub}</span></div>
                </div>
              ))}
            </div>

            {/* Guarantee */}
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:'1.25rem',textAlign:'center'}}>
              <div style={{fontSize:'1.5rem',marginBottom:'0.25rem'}}>💚</div>
              <div style={{fontWeight:700,fontSize:'0.85rem',color:'#16a34a',fontFamily:'sans-serif'}}>7-Day Satisfaction Guarantee</div>
              <div style={{fontSize:'0.75rem',color:'#374151',marginTop:'0.25rem',fontFamily:'sans-serif',lineHeight:1.5}}>Not satisfied? Contact us within 7 days for a full refund.</div>
            </div>

            <div style={{textAlign:'center',fontSize:'0.75rem',color:'#6b7280',fontFamily:'sans-serif'}}>
              Questions? <a href="mailto:NSIcertsadmin@gmail.com" style={{color:'#0B1629',fontWeight:600}}>NSIcertsadmin@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const pageWrap = { background: '#f1f5f9', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '4rem' }
const card = { background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem' }
const sectionLabel = { fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem', fontFamily: 'sans-serif' }
const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', fontFamily: 'sans-serif' }
const fieldWrap = { border: '1.5px solid #d1d5db', borderRadius: 8, padding: '10px 14px', background: '#fff', display: 'flex', alignItems: 'center', minHeight: 46 }
