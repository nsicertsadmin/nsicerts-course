import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { supabase } from '../lib/supabase'

const COURSE_NAMES = {
  mewp: 'MEWP Operator Safety Training For Aerial & Scissor Lifts'
}

const COURSE_STANDARDS = {
  mewp: [
    { label: 'OSHA', sub: '29 CFR 1926.453 & 29 CFR 1910.67', color: '#CC0000' },
    { label: 'ANSI', sub: 'A92.22-2018 & A92.24-2021', color: '#000066' },
    { label: 'CSA', sub: 'CAN/CSA-B354.6:17', color: '#CC0000' },
  ]
}

const MEWP_GROUPS = [
  ['Group A, Type 1 – Inside Tipping Line; Travels When Stowed', 'Group B, Type 1 – Beyond Tipping Line; Travels When Stowed'],
  ['Group A, Type 2 – Inside Tipping Line; Controlled At Chassis', 'Group B, Type 2 – Beyond Tipping Line; Controlled At Chassis'],
  ['Group A, Type 3 – Inside Tipping Line; Controlled At Platform', 'Group B, Type 3 – Beyond Tipping Line; Controlled At Platform'],
]

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function Certificate() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [certData, setCertData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCert() }, [user, courseId])

  const loadCert = async () => {
    const { data } = await supabase
      .from('certifications').select('*')
      .eq('user_id', user.id).eq('course_id', courseId).single()
    setCertData(data)
    setLoading(false)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <div className="main-content"><p>Loading...</p></div>
  if (!certData) return (
    <div className="main-content">
      <p>Certificate not found. Please complete the course first.</p>
      <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/dashboard')}>← Dashboard</button>
    </div>
  )

  const fullName = user?.user_metadata?.full_name || user?.email || 'Student'
  const issuedDate = formatDate(certData.issued_at)
  const expiryDate = formatDate(certData.expires_at)
  const certNum = certData.cert_number
  const verifyURL = `https://nsicerts.org/verify/${certNum}`
  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyURL)}&color=0A1F44&bgcolor=C9A84C&margin=4`

  return (
    <>
      {/* Print styles - hide everything except certificate */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #cert-printable, #cert-printable * { visibility: visible !important; }
          #cert-printable {
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            width: 100% !important;
            margin: 0 !important; padding: 0.2in !important;
            box-sizing: border-box !important;
          }
          #cert-printable > div[style*="display: flex"][style*="gap: 0"] {
            max-width: 80% !important;
          }
          @page { size: landscape; margin: 0.25in; }
        }
        @media screen {
          #cert-printable { max-width: 900px; margin: 0 auto; }
        }
      `}</style>

      {/* Screen-only header */}
      <div className="main-content" style={{ paddingBottom: '2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }} className="no-print">
            <h1 style={{ color: 'var(--navy)', marginBottom: '0.5rem' }}>🎓 Your Certificate</h1>
            <p style={{ color: 'var(--gray-600)' }}>Congratulations! Print or save as PDF below.</p>
          </div>

          {/* THE CERTIFICATE */}
          <div id="cert-printable" style={{
            background: 'white',
            border: '6px solid #C9A84C',
            fontFamily: 'Georgia, serif',
            padding: '1.5rem 2rem',
          }}>

            {/* TOP ROW: Logo + Compliance badges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '2px solid #C9A84C' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#0A1F44', border: '3px solid #C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1.1rem', fontFamily: 'sans-serif' }}>NSI</span>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0A1F44', fontFamily: 'sans-serif' }}>NATIONAL SAFETY INSTITUTE</div>
                  <div style={{ fontSize: '0.65rem', color: '#C9A84C', fontFamily: 'sans-serif' }}>NSICerts.org</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
                {COURSE_STANDARDS[courseId]?.map((b, i) => (
                  <div key={b.label}>
                    <div style={{
                      fontWeight: 900, fontSize: '1.25rem', color: b.color,
                      fontStyle: i === 2 ? 'normal' : 'italic',
                      fontFamily: i === 0 ? '"Arial Black", Impact, sans-serif' : i === 1 ? '"Arial Black", Impact, sans-serif' : '"Times New Roman", Georgia, serif',
                      letterSpacing: i === 2 ? '1px' : '0',
                    }}>{b.label}</div>
                    <div style={{ fontSize: '0.6rem', color: '#555' }}>Compliant with {b.sub.split('&')[0]}</div>
                    {b.sub.includes('&') && <div style={{ fontSize: '0.6rem', color: '#555' }}>& {b.sub.split('&')[1]}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* TITLE */}
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '2.4rem', color: '#000', marginBottom: '0.25rem' }}>Certificate of Completion</div>
              <div style={{ fontSize: '1rem', fontStyle: 'italic', color: '#444' }}>{COURSE_NAMES[courseId]}</div>
            </div>

            {/* RECIPIENT NAME */}
            <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0A1F44', borderBottom: '2px solid #000', display: 'inline-block', paddingBottom: '0.2rem', minWidth: 300 }}>
                {fullName}
              </div>
            </div>

            {/* BODY TEXT */}
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#555', margin: '0.5rem 3rem', lineHeight: 1.6 }}>
              successfully completed the National Safety Institute MEWP Operator Safety Training, which is the formal
              instruction required to safely operate aerial and scissor lifts, Groups A & B; Types 1, 2, and 3.
            </p>

            {/* DATES ROW */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', margin: '0.75rem 0', fontFamily: 'sans-serif' }}>
              {[
                { val: issuedDate, label: 'Issue Date' },
                { val: expiryDate, label: 'Expiration Date' },
                { val: certNum, label: 'Certification Number' },
              ].map(f => (
                <div key={f.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid #333', paddingBottom: '0.2rem', minWidth: 150 }}>{f.val}</div>
                  <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '0.2rem' }}>{f.label}</div>
                </div>
              ))}
            </div>

            {/* MEWP GROUPS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.2rem 2rem', margin: '0.5rem 1rem', fontFamily: 'sans-serif', fontSize: '0.78rem' }}>
              {MEWP_GROUPS.flat().map(g => <div key={g}>☑ {g}</div>)}
            </div>

            {/* GOLD DIVIDER */}
            <div style={{ borderTop: '1.5px solid #C9A84C', margin: '0.75rem 0 0.4rem' }} />
            <div style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'sans-serif', marginBottom: '0.4rem' }}>✂  CUT AND FOLD gold section below for wallet</div>

            {/* WALLET CARDS - dashed border around entire section */}
            <div style={{
              display: 'flex', gap: 0,
              border: '2px dashed #888',
              borderRadius: 4,
              overflow: 'hidden',
              width: 'fit-content',
              maxWidth: '85%',
            }}>

              {/* LEFT WALLET CARD */}
              <div style={{
                flex: '0 0 50%', background: '#C9A84C',
                border: '3px solid #0A1F44', borderRight: '1.5px solid #0A1F44',
                padding: '0.5rem 0.6rem', fontFamily: 'sans-serif', fontSize: '0.7rem',
                WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'
              }}>
                {/* Navy header */}
                <div style={{ background: '#0A1F44', margin: '-0.5rem -0.6rem 0.4rem', padding: '0.25rem', textAlign: 'center', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <div style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.75rem' }}>CERTIFIED MEWP OPERATOR</div>
                </div>

                {/* NSI logo + student name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: '#0A1F44',
                    border: '2px solid #C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'
                  }}>
                    <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.6rem', fontFamily: 'sans-serif' }}>NSI</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#0A1F44', fontSize: '0.72rem', lineHeight: 1.1 }}>{fullName}</div>
                    <div style={{ borderBottom: '1px solid #0A1F44', marginTop: '0.15rem' }} />
                  </div>
                </div>

                {/* Body text */}
                <div style={{ color: '#333', fontSize: '0.58rem', lineHeight: 1.4, marginBottom: '0.4rem' }}>
                  The above individual has fulfilled the practical evaluation and formal course required to be certified per OSHA 29 CFR 1926.453, ANSI/SAIA A92.22 & A92.24, and CAN/CSA-B354.6:17.
                </div>

                {/* Issue / Exp dates */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ borderBottom: '1px solid #0A1F44', paddingBottom: '0.1rem', color: '#0A1F44', fontSize: '0.62rem' }}>{issuedDate}</div>
                    <div style={{ fontSize: '0.52rem', color: '#0A1F44' }}>ISSUE DATE</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ borderBottom: '1px solid #0A1F44', paddingBottom: '0.1rem', color: '#0A1F44', fontSize: '0.62rem' }}>{expiryDate}</div>
                    <div style={{ fontSize: '0.52rem', color: '#0A1F44' }}>EXPIRATION DATE</div>
                  </div>
                </div>
              </div>

              {/* FOLD LINE - solid thin line */}
              <div style={{ width: 1, background: '#0A1F44', opacity: 0.3 }} />

              {/* RIGHT WALLET CARD */}
              <div style={{ flex: '0 0 50%', background: '#C9A84C', border: '3px solid #0A1F44', borderLeft: '1.5px solid #0A1F44', padding: '0.5rem 0.6rem', fontFamily: 'sans-serif', fontSize: '0.7rem', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                {/* Header */}
                <div style={{ background: '#0A1F44', margin: '-0.5rem -0.6rem 0.4rem', padding: '0.25rem', textAlign: 'center', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                  <div style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.75rem' }}>CERTIFIED MEWP OPERATOR</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {/* Left col - info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#0A1F44', fontSize: '0.7rem' }}>National Safety Institute</div>
                    <div style={{ color: '#0A1F44', fontSize: '0.55rem' }}>TRAINING CENTER</div>
                    <div style={{ color: '#0A1F44', fontSize: '0.6rem', marginBottom: '0.4rem' }}>NSICerts.org</div>

                    <div style={{ borderBottom: '1px solid #0A1F44', paddingBottom: '0.1rem', color: '#0A1F44', fontSize: '0.65rem' }}>{certNum}</div>
                    <div style={{ fontSize: '0.55rem', color: '#0A1F44', marginBottom: '0.4rem' }}>CERTIFICATION NUMBER</div>

                    <div style={{ borderTop: '1px solid #0A1F44', paddingTop: '0.3rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.62rem', color: '#0A1F44' }}>PRACTICAL EXAMINATION</div>
                      <div style={{ fontSize: '0.55rem', color: '#444', marginBottom: '0.25rem' }}>To be completed by evaluator</div>
                      <div style={{ borderBottom: '1px solid #0A1F44', marginBottom: '0.1rem', height: '0.9rem' }} />
                      <div style={{ fontSize: '0.55rem', color: '#0A1F44', marginBottom: '0.25rem' }}>DATE COMPLETED</div>
                      <div style={{ borderBottom: '1px solid #0A1F44', marginBottom: '0.1rem', height: '0.9rem' }} />
                      <div style={{ fontSize: '0.55rem', color: '#0A1F44' }}>EVALUATOR NAME</div>
                    </div>
                  </div>

                  {/* Right col - QR code */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 85 }}>
                    <div style={{ background: 'white', padding: 3, borderRadius: 4 }}>
                      <img src={qrURL} alt="Verify Certificate" style={{ width: 75, height: 75, display: 'block' }} />
                    </div>
                    <div style={{ fontSize: '0.5rem', color: '#0A1F44', fontWeight: 700, marginTop: '0.25rem', textAlign: 'center' }}>SCAN TO VERIFY</div>
                    <div style={{ fontSize: '0.45rem', color: '#333', textAlign: 'center' }}>nsicerts.org/verify</div>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#666', fontFamily: 'sans-serif', textAlign: 'center' }}>
              <strong>Practical Evaluation:</strong> Employers require that you complete practical training, including demonstrations performed by a knowledgeable and experienced trainer and exercises performed by you.
            </div>
            <div style={{ fontSize: '0.6rem', color: '#999', fontFamily: 'sans-serif', textAlign: 'center' }}>
              © National Safety Institute | NSICerts.org | Renew certification every 3 years.
            </div>
          </div>

          {/* Cert details card */}
          <div className="card" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
              <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginBottom: '0.2rem' }}>CERTIFICATE NUMBER</div><strong style={{ color: 'var(--navy)', fontSize: '1.1rem' }}>{certNum}</strong></div>
              <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginBottom: '0.2rem' }}>ISSUED</div><strong>{issuedDate}</strong></div>
              <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginBottom: '0.2rem' }}>EXPIRES</div><strong>{expiryDate}</strong></div>
              <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginBottom: '0.2rem' }}>EXAM SCORE</div><strong style={{ color: 'var(--green)' }}>{certData.score}%</strong></div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={handlePrint}>
              🖨 Print / Save as PDF
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
              ← Dashboard
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '1rem' }}>
            Tip: In the print dialog, set Layout to <strong>Landscape</strong> and click <strong>Save as PDF</strong> to download.
          </p>
        </div>
      </div>
    </>
  )
}
