import { useEffect, useState } from 'react'
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

async function loadQRLib() {
  if (window.QRCode) return
  await new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js'
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

async function generateQRDataURL(text) {
  await loadQRLib()
  return await window.QRCode.toDataURL(text, {
    width: 200,
    margin: 1,
    color: { dark: '#0A1F44', light: '#C9A84C' }
  })
}

async function generatePDF(certData, fullName, courseId) {
  const { jsPDF } = await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js')

  const verifyURL = `https://nsicerts.org/verify/${certData.cert_number}`
  const qrDataURL = await generateQRDataURL(verifyURL)

  const NAVY = [10, 31, 68]
  const GOLD = [201, 168, 76]
  const GRAY = [100, 100, 100]
  const RED = [180, 0, 0]
  const BLUE_DARK = [0, 0, 100]
  const BLACK = [0, 0, 0]

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' })
  const W = 792, H = 612

  const issuedDate = formatDate(certData.issued_at)
  const expiryDate = formatDate(certData.expires_at)
  const certNum = certData.cert_number

  // ── GOLD PAGE BORDER ──
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(6)
  doc.rect(12, 12, W - 24, H - 24, 'S')
  doc.setLineWidth(1.5)
  doc.rect(18, 18, W - 36, H - 36, 'S')

  // ── LEFT ACCENT + NSI LOGO ──
  doc.setFillColor(...GOLD)
  doc.rect(30, 24, 4, 130, 'F')
  doc.setFillColor(...NAVY)
  doc.circle(70, 80, 42, 'F')
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(2)
  doc.circle(70, 80, 38, 'S')
  doc.setFontSize(22)
  doc.setTextColor(...GOLD)
  doc.setFont('helvetica', 'bold')
  doc.text('NSI', 70, 86, { align: 'center' })

  doc.setFontSize(9)
  doc.setTextColor(...NAVY)
  doc.setFont('helvetica', 'bold')
  doc.text('NATIONAL SAFETY', 125, 68)
  doc.text('INSTITUTE', 125, 80)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GOLD)
  doc.setFontSize(8)
  doc.text('NSICerts.org', 125, 92)

  // ── COMPLIANCE BADGES ──
  const badges = COURSE_STANDARDS[courseId] || []
  let bx = 300
  badges.forEach(b => {
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...(b.color === '#CC0000' ? RED : BLUE_DARK))
    doc.text(b.label, bx, 75, { align: 'center' })
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    const lines = b.sub.split('&')
    doc.text(`Compliant with ${lines[0].trim()}`, bx, 88, { align: 'center' })
    if (lines[1]) doc.text(`& ${lines[1].trim()}`, bx, 98, { align: 'center' })
    bx += 150
  })

  // ── GOLD DIVIDER ──
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(2)
  doc.line(30, 130, W - 30, 130)

  // ── CERTIFICATE TITLE ──
  doc.setFontSize(38)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...BLACK)
  doc.text('Certificate of Completion', W / 2, 175, { align: 'center' })

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bolditalic')
  doc.setTextColor(60, 60, 60)
  doc.text(COURSE_NAMES[courseId] || '', W / 2, 198, { align: 'center' })

  // ── RECIPIENT NAME ──
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NAVY)
  doc.text(fullName, W / 2, 240, { align: 'center' })
  const nameWidth = doc.getTextWidth(fullName)
  doc.setDrawColor(...BLACK)
  doc.setLineWidth(1)
  doc.line(W / 2 - nameWidth / 2 - 10, 245, W / 2 + nameWidth / 2 + 10, 245)

  // ── BODY TEXT ──
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text('successfully completed the National Safety Institute MEWP Operator Safety Training, which is the formal', W / 2, 263, { align: 'center' })
  doc.text('instruction required to safely operate aerial and scissor lifts, Groups A & B; Types 1, 2, and 3.', W / 2, 276, { align: 'center' })

  // ── DATES ROW ──
  const cols = [W / 2 - 200, W / 2, W / 2 + 200]
  const vals = [issuedDate, expiryDate, certNum]
  const labels = ['Issue Date', 'Expiration Date', 'Certification Number']
  cols.forEach((cx, i) => {
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...BLACK)
    doc.text(vals[i], cx, 305, { align: 'center' })
    doc.setDrawColor(...BLACK)
    doc.setLineWidth(0.75)
    doc.line(cx - 90, 308, cx + 90, 308)
    doc.setFontSize(8.5)
    doc.setTextColor(...GRAY)
    doc.text(labels[i], cx, 320, { align: 'center' })
  })

  // ── MEWP GROUPS ──
  let gy = 340
  MEWP_GROUPS.forEach(([left, right]) => {
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...BLACK)
    doc.text(`☑ ${left}`, 100, gy)
    doc.text(`☑ ${right}`, W / 2 + 10, gy)
    gy += 14
  })

  // ── GOLD DIVIDER + CUT LINE ──
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(1.5)
  doc.line(30, 385, W - 30, 385)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text('✂  CUT AND FOLD gold section below for wallet', 40, 397)

  // ── WALLET CARDS ──
  const cardW = 243, cardH = 153
  const cardY = 408
  const card1X = 40
  const card2X = card1X + cardW + 8

  // Gold backgrounds
  doc.setFillColor(...GOLD)
  doc.rect(card1X, cardY, cardW, cardH, 'F')
  doc.rect(card2X, cardY, cardW, cardH, 'F')

  // Navy borders
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(3)
  doc.rect(card1X, cardY, cardW, cardH, 'S')
  doc.rect(card2X, cardY, cardW, cardH, 'S')

  // Dashed fold line
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(1)
  doc.setLineDashPattern([4, 3], 0)
  doc.line(card2X - 4, cardY, card2X - 4, cardY + cardH)
  doc.setLineDashPattern([], 0)

  // ── LEFT CARD ──
  const lx = card1X + cardW / 2

  // Navy header bar
  doc.setFillColor(...NAVY)
  doc.rect(card1X, cardY, cardW, 20, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GOLD)
  doc.text('CERTIFIED MEWP OPERATOR', lx, cardY + 13, { align: 'center' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...NAVY)
  doc.text('Aerial & Scissor Lifts', lx, cardY + 28, { align: 'center' })

  // Student signature
  doc.setFontSize(7)
  doc.setTextColor(...NAVY)
  doc.text('STUDENT SIGNATURE', lx, cardY + 42, { align: 'center' })
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.75)
  doc.line(card1X + 10, cardY + 45, card1X + cardW - 10, cardY + 45)

  // Body text
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(50, 50, 50)
  const bodyLines = doc.splitTextToSize(
    'The above individual has fulfilled the practical evaluation and formal course required to be certified per OSHA 29 CFR 1926.453, ANSI/SAIA A92.22 & A92.24, and CAN/CSA-B354.6:17.',
    cardW - 20
  )
  doc.text(bodyLines, card1X + 10, cardY + 55)

  // Issue / Exp dates
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...NAVY)
  doc.text(issuedDate, card1X + cardW * 0.25, cardY + 98, { align: 'center' })
  doc.text(expiryDate, card1X + cardW * 0.75, cardY + 98, { align: 'center' })
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.75)
  doc.line(card1X + 10, cardY + 101, card1X + cardW / 2 - 5, cardY + 101)
  doc.line(card1X + cardW / 2 + 5, cardY + 101, card1X + cardW - 10, cardY + 101)
  doc.setFontSize(7)
  doc.setTextColor(...NAVY)
  doc.text('ISSUE DATE', card1X + cardW * 0.25, cardY + 110, { align: 'center' })
  doc.text('EXPIRATION DATE', card1X + cardW * 0.75, cardY + 110, { align: 'center' })

  // Practical exam section - left card
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.75)
  doc.line(card1X + 10, cardY + 118, card1X + cardW - 10, cardY + 118)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NAVY)
  doc.text('PRACTICAL EXAMINATION', lx, cardY + 127, { align: 'center' })
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text('To be completed by evaluator', lx, cardY + 135, { align: 'center' })
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.75)
  doc.line(card1X + 10, cardY + 145, card1X + cardW / 2 - 5, cardY + 145)
  doc.line(card1X + cardW / 2 + 5, cardY + 145, card1X + cardW - 10, cardY + 145)
  doc.setFontSize(6.5)
  doc.setTextColor(...NAVY)
  doc.text('DATE COMPLETED', card1X + cardW * 0.25, cardY + 151, { align: 'center' })
  doc.text('EVALUATOR NAME', card1X + cardW * 0.75, cardY + 151, { align: 'center' })

  // ── RIGHT CARD ──
  const rx = card2X + cardW / 2

  // Navy header bar
  doc.setFillColor(...NAVY)
  doc.rect(card2X, cardY, cardW, 20, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GOLD)
  doc.text('CERTIFIED MEWP OPERATOR', rx, cardY + 13, { align: 'center' })

  // Training center info (left column of right card)
  const rightColSplit = card2X + 130  // split right card into left info / right QR
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NAVY)
  doc.text('National Safety Institute', card2X + 10, cardY + 32)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('TRAINING CENTER', card2X + 10, cardY + 42)
  doc.text('NSICerts.org', card2X + 10, cardY + 52)

  // Cert number with gold underline
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...NAVY)
  doc.text(certNum, card2X + 10, cardY + 72)
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.75)
  doc.line(card2X + 10, cardY + 75, rightColSplit - 5, cardY + 75)
  doc.setFontSize(7)
  doc.setTextColor(...NAVY)
  doc.text('CERTIFICATION NUMBER', card2X + 10, cardY + 83)

  // Practical exam section (below cert number on right card)
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.5)
  doc.line(card2X + 10, cardY + 92, rightColSplit - 5, cardY + 92)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NAVY)
  doc.text('PRACTICAL EXAMINATION', card2X + 10, cardY + 101)
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text('To be completed by evaluator', card2X + 10, cardY + 110)

  // Date completed / Evaluator name on right card
  doc.setDrawColor(...NAVY)
  doc.setLineWidth(0.75)
  doc.line(card2X + 10, cardY + 128, rightColSplit - 5, cardY + 128)
  doc.line(card2X + 10, cardY + 145, rightColSplit - 5, cardY + 145)
  doc.setFontSize(6.5)
  doc.setTextColor(...NAVY)
  doc.text('DATE COMPLETED', card2X + 10, cardY + 134)
  doc.text('EVALUATOR NAME', card2X + 10, cardY + 151)

  // ── QR CODE (orange box position — right side of right card) ──
  const qrSize = 88  // points — fits nicely in right card
  const qrX = rightColSplit + 5
  const qrY = cardY + 22

  // White background box for QR
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 2, 2, 'F')

  // Add QR image
  doc.addImage(qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize)

  // "Scan to verify" label
  doc.setFontSize(6)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NAVY)
  doc.text('SCAN TO VERIFY', qrX + qrSize / 2, qrY + qrSize + 10, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(60, 60, 60)
  doc.text('nsicerts.org/verify', qrX + qrSize / 2, qrY + qrSize + 18, { align: 'center' })

  // ── FOOTER ──
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(60, 60, 60)
  doc.text(
    'Practical Evaluation: Employers require that you complete practical training, including demonstrations performed by a knowledgeable and experienced trainer',
    W / 2, H - 35, { align: 'center' }
  )
  doc.text(
    'and exercises performed by you. The trainer will confirm the completion of your practical training on your license above.',
    W / 2, H - 25, { align: 'center' }
  )
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text('© National Safety Institute | NSICerts.org | Renew certification every 3 years.', W / 2, H - 14, { align: 'center' })

  return doc
}

export default function Certificate() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [certData, setCertData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => { loadCert() }, [user, courseId])

  const loadCert = async () => {
    const { data } = await supabase
      .from('certifications').select('*')
      .eq('user_id', user.id).eq('course_id', courseId).single()
    setCertData(data)
    setLoading(false)
  }

  const fullName = user?.user_metadata?.full_name || user?.email || 'Student'

  const handleDownload = async () => {
    setGenerating(true)
    try {
      const doc = await generatePDF(certData, fullName, courseId)
      doc.save(`NSI-Certificate-${certData.cert_number}.pdf`)
    } catch (err) {
      console.error('PDF error:', err)
      alert('Error generating PDF. Please try again.')
    }
    setGenerating(false)
  }

  const handlePrint = async () => {
    setGenerating(true)
    try {
      const doc = await generatePDF(certData, fullName, courseId)
      doc.autoPrint()
      window.open(doc.output('bloburl'), '_blank')
    } catch (err) {
      console.error('Print error:', err)
    }
    setGenerating(false)
  }

  if (loading) return <div className="main-content"><p>Loading...</p></div>
  if (!certData) return (
    <div className="main-content">
      <p>Certificate not found. Please complete the course first.</p>
      <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/dashboard')}>← Dashboard</button>
    </div>
  )

  const verifyURL = `https://nsicerts.org/verify/${certData.cert_number}`

  return (
    <div className="main-content">
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ color: 'var(--navy)', marginBottom: '0.5rem' }}>🎓 Your Certificate</h1>
          <p style={{ color: 'var(--gray-600)' }}>Congratulations! Your certificate is ready to download.</p>
        </div>

        {/* Certificate preview */}
        <div style={{
          background: 'white', border: '6px solid #C9A84C', borderRadius: 8,
          padding: '2rem', textAlign: 'center', fontFamily: 'Georgia, serif',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)', marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px solid #C9A84C' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0A1F44', fontFamily: 'sans-serif' }}>🛡 NATIONAL SAFETY INSTITUTE</div>
              <div style={{ fontSize: '0.7rem', color: '#C9A84C', fontFamily: 'sans-serif' }}>NSICerts.org</div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
              {(COURSE_STANDARDS[courseId] || []).map(b => (
                <div key={b.label}>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: b.color }}>{b.label}</div>
                  <div style={{ color: '#666', fontSize: '0.65rem' }}>Compliant with {b.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '2rem', color: '#0A1F44', marginBottom: '0.25rem' }}>Certificate of Completion</div>
          <div style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#444', marginBottom: '1.5rem' }}>{COURSE_NAMES[courseId]}</div>

          <div style={{ fontSize: '2rem', color: '#0A1F44', borderBottom: '2px solid #333', display: 'inline-block', paddingBottom: '0.25rem', marginBottom: '0.375rem', minWidth: 320 }}>
            {fullName}
          </div>

          <p style={{ fontSize: '0.85rem', color: '#555', margin: '0.75rem 2rem', lineHeight: 1.6 }}>
            successfully completed the National Safety Institute MEWP Operator Safety Training, which is the formal
            instruction required to safely operate aerial and scissor lifts, Groups A & B; Types 1, 2, and 3.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', margin: '1rem 0', fontFamily: 'sans-serif' }}>
            {[
              { val: formatDate(certData.issued_at), label: 'Issue Date' },
              { val: formatDate(certData.expires_at), label: 'Expiration Date' },
              { val: certData.cert_number, label: 'Certification Number' },
            ].map(f => (
              <div key={f.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, borderBottom: '1px solid #333', paddingBottom: '0.2rem' }}>{f.val}</div>
                <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '0.2rem' }}>{f.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.2rem', textAlign: 'left', fontSize: '0.75rem', margin: '0.75rem 2rem', color: '#333', fontFamily: 'sans-serif' }}>
            {MEWP_GROUPS.flat().map(g => <div key={g}>☑ {g}</div>)}
          </div>

          {/* QR code preview on screen */}
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', display: 'inline-block' }}>
            <div style={{ fontSize: '0.7rem', color: '#666', fontFamily: 'sans-serif', marginBottom: '0.5rem' }}>SCAN TO VERIFY CERTIFICATE</div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyURL)}&color=0A1F44&bgcolor=C9A84C`}
              alt="QR Code"
              style={{ width: 100, height: 100 }}
            />
            <div style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'sans-serif', marginTop: '0.25rem' }}>nsicerts.org/verify/{certData.cert_number}</div>
          </div>
        </div>

        {/* Cert details */}
        <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginBottom: '0.2rem' }}>CERTIFICATE NUMBER</div><strong style={{ color: 'var(--navy)', fontSize: '1.1rem' }}>{certData.cert_number}</strong></div>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginBottom: '0.2rem' }}>ISSUED</div><strong>{formatDate(certData.issued_at)}</strong></div>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginBottom: '0.2rem' }}>EXPIRES</div><strong>{formatDate(certData.expires_at)}</strong></div>
            <div><div style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginBottom: '0.2rem' }}>EXAM SCORE</div><strong style={{ color: 'var(--green)' }}>{certData.score}%</strong></div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={handleDownload} disabled={generating}>
            {generating ? '⏳ Generating PDF...' : '⬇ Download PDF Certificate'}
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} disabled={generating}>
            🖨 Print
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '1rem' }}>
          Certificate #{certData.cert_number} · Valid 3 years · Verify at <a href={verifyURL} target="_blank" rel="noreferrer" style={{ color: 'var(--navy)' }}>nsicerts.org/verify/{certData.cert_number}</a>
        </p>
      </div>
    </div>
  )
}
