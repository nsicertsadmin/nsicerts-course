import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { supabase } from '../lib/supabase'
import { MEWP_COURSE } from '../lib/mewpCourse'

const COURSES = { mewp: MEWP_COURSE }
const COURSE_NAMES = { mewp: 'MEWP Operator Safety Training For Aerial & Scissor Lifts' }

export default function Certificate() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const [certData, setCertData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCert()
  }, [user, courseId])

  const loadCert = async () => {
    const { data } = await supabase
      .from('certifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()
    setCertData(data)
    setLoading(false)
  }

  const formatDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (loading) return <div className="main-content"><p>Loading...</p></div>
  if (!certData) return <div className="main-content"><p>Certificate not found. Please complete the course first.</p></div>

  const fullName = user?.user_metadata?.full_name || user?.email

  return (
    <div className="main-content">
      <div className="cert-wrapper">
        <h1>🎓 Your Certificate</h1>
        <p>Congratulations on completing your NSI certification!</p>

        {/* Certificate preview */}
        <div id="cert-preview" style={{
          maxWidth: 800, margin: '0 auto',
          background: 'white',
          border: '6px solid #C9A84C',
          borderRadius: 8,
          padding: '2.5rem',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          fontFamily: 'Georgia, serif'
        }}>
          {/* Compliance badges */}
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', paddingBottom:'1rem', borderBottom:'2px solid #C9A84C'}}>
            <div style={{textAlign:'left'}}>
              <div style={{fontSize:'1.1rem', fontWeight:700, color:'#0A1F44', fontFamily:'sans-serif'}}>🛡 NATIONAL SAFETY INSTITUTE</div>
              <div style={{fontSize:'0.75rem', color:'#C9A84C', fontFamily:'sans-serif'}}>NSICerts.org</div>
            </div>
            <div style={{display:'flex', gap:'1.5rem', fontSize:'0.75rem', textAlign:'center', fontFamily:'sans-serif'}}>
              <div><div style={{fontWeight:800, fontSize:'1rem', color:'#CC0000'}}>OSHA</div><div style={{color:'#666'}}>1926.453</div></div>
              <div><div style={{fontWeight:800, fontSize:'1rem', color:'#000066'}}>ANSI</div><div style={{color:'#666'}}>A92.22 & A92.24</div></div>
              <div><div style={{fontWeight:800, fontSize:'1rem', color:'#CC0000'}}>CSA</div><div style={{color:'#666'}}>B354.6:17</div></div>
            </div>
          </div>

          <div style={{fontSize:'2.25rem', color:'#0A1F44', marginBottom:'0.5rem'}}>Certificate of Completion</div>
          <div style={{fontSize:'1rem', fontStyle:'italic', color:'#444', marginBottom:'2rem'}}>{COURSE_NAMES[courseId]}</div>

          <div style={{fontSize:'2rem', color:'#0A1F44', borderBottom:'2px solid #333', display:'inline-block', paddingBottom:'0.25rem', marginBottom:'0.5rem', minWidth:300}}>
            {fullName}
          </div>

          <p style={{fontSize:'0.85rem', color:'#555', margin:'1rem 2rem', lineHeight:1.6}}>
            successfully completed the National Safety Institute MEWP Operator Safety Training, which is the formal instruction required to safely operate aerial and scissor lifts, Groups A & B; Types 1, 2, and 3.
          </p>

          {/* Dates row */}
          <div style={{display:'flex', justifyContent:'center', gap:'3rem', margin:'1.5rem 0', fontFamily:'sans-serif'}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'1rem', fontWeight:600, borderBottom:'1px solid #333', paddingBottom:'0.25rem'}}>{formatDate(certData.issued_at)}</div>
              <div style={{fontSize:'0.7rem', color:'#888', marginTop:'0.25rem'}}>Issue Date</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'1rem', fontWeight:600, borderBottom:'1px solid #333', paddingBottom:'0.25rem'}}>{formatDate(certData.expires_at)}</div>
              <div style={{fontSize:'0.7rem', color:'#888', marginTop:'0.25rem'}}>Expiration Date</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'1rem', fontWeight:600, borderBottom:'1px solid #333', paddingBottom:'0.25rem'}}>{certData.cert_number}</div>
              <div style={{fontSize:'0.7rem', color:'#888', marginTop:'0.25rem'}}>Certification Number</div>
            </div>
          </div>

          {/* MEWP groups */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.25rem', textAlign:'left', fontSize:'0.8rem', margin:'1rem 2rem', color:'#333', fontFamily:'sans-serif'}}>
            {['Group A, Type 1 - Inside Tipping Line; Travels When Stowed','Group A, Type 2 - Inside Tipping Line; Controlled At Chassis','Group A, Type 3 - Inside Tipping Line; Controlled At Platform','Group B, Type 1 - Beyond Tipping Line; Travels When Stowed','Group B, Type 2 - Beyond Tipping Line; Controlled At Chassis','Group B, Type 3 - Beyond Tipping Line; Controlled At Platform'].map(g => (
              <div key={g}>☑ {g}</div>
            ))}
          </div>

          <div style={{fontSize:'0.7rem', color:'#888', marginTop:'1.5rem', fontFamily:'sans-serif'}}>
            © National Safety Institute | NSICerts.org | Verify at NSICerts.org/verify/{certData.cert_number}
          </div>
        </div>

        <div style={{display:'flex', gap:'1rem', justifyContent:'center', marginTop:'1.5rem'}}>
          <button className="btn btn-primary btn-lg" onClick={() => window.print()}>
            🖨 Print Certificate
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/dashboard'}>
            ← Back to Dashboard
          </button>
        </div>

        <div style={{marginTop:'1rem', fontSize:'0.8rem', color:'var(--gray-400)'}}>
          Certificate #{certData.cert_number} · Valid until {formatDate(certData.expires_at)}
        </div>
      </div>
    </div>
  )
}
