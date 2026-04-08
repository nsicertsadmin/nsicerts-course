import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const COURSE_NAMES = {
  mewp: 'MEWP Operator Safety Training — Aerial & Scissor Lifts',
  forklift: 'Forklift Operator Safety Training',
  fall: 'Fall Protection Safety Training',
  hazcom: 'HazCom / GHS Safety Training',
  loto: 'Lockout/Tagout (LOTO) Safety Training',
  confined: 'Confined Space Entry Safety Training',
}

export default function Verify() {
  const { certNumber } = useParams()
  const [cert, setCert] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    loadCert()
  }, [certNumber])

  const loadCert = async () => {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('cert_number', certNumber)
      .single()

    if (error || !data) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setCert(data)

    // Load profile name
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', data.user_id)
      .single()

    setProfile(profileData)
    setLoading(false)
  }

  const isExpired = cert && new Date(cert.expires_at) < new Date()
  const isValid = cert && !isExpired

  if (loading) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoCircle}><span style={styles.logoText}>NSI</span></div>
          <div>
            <div style={styles.orgName}>NATIONAL SAFETY INSTITUTE</div>
            <div style={styles.orgSub}>NSICerts.org</div>
          </div>
        </div>
        <p style={{ textAlign: 'center', color: '#666' }}>Verifying certificate...</p>
      </div>
    </div>
  )

  if (notFound) return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoCircle}><span style={styles.logoText}>NSI</span></div>
          <div>
            <div style={styles.orgName}>NATIONAL SAFETY INSTITUTE</div>
            <div style={styles.orgSub}>NSICerts.org</div>
          </div>
        </div>
        <div style={{ ...styles.badge, background: '#fee2e2', border: '2px solid #ef4444' }}>
          <div style={{ fontSize: '2.5rem' }}>❌</div>
          <div style={{ ...styles.badgeTitle, color: '#dc2626' }}>Certificate Not Found</div>
          <div style={styles.badgeSub}>No certificate matches number <strong>{certNumber}</strong>.<br />This certificate may be invalid or fraudulent.</div>
        </div>
        <div style={styles.footer}>
          Questions? Contact us at <a href="mailto:NSIcertsadmin@gmail.com" style={{ color: '#C9A84C' }}>NSIcertsadmin@gmail.com</a>
        </div>
      </div>
    </div>
  )

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.logo}>
          <div style={styles.logoCircle}><span style={styles.logoText}>NSI</span></div>
          <div>
            <div style={styles.orgName}>NATIONAL SAFETY INSTITUTE</div>
            <div style={styles.orgSub}>NSICerts.org — Certificate Verification</div>
          </div>
        </div>

        <div style={{ borderTop: '2px solid #C9A84C', margin: '1rem 0' }} />

        {/* Valid / Expired Badge */}
        <div style={{
          ...styles.badge,
          background: isValid ? '#f0fdf4' : '#fff7ed',
          border: `2px solid ${isValid ? '#22c55e' : '#f97316'}`
        }}>
          <div style={{ fontSize: '3rem' }}>{isValid ? '✅' : '⚠️'}</div>
          <div style={{ ...styles.badgeTitle, color: isValid ? '#16a34a' : '#ea580c' }}>
            {isValid ? 'VALID CERTIFICATE' : 'EXPIRED CERTIFICATE'}
          </div>
          <div style={styles.badgeSub}>
            {isValid
              ? 'This certificate is authentic and currently valid.'
              : 'This certificate was valid but has since expired. Renewal is required.'}
          </div>
        </div>

        {/* Cert Details */}
        <div style={styles.detailsGrid}>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>CERTIFICATE HOLDER</div>
            <div style={styles.detailValue}>{profile?.full_name || profile?.email || 'N/A'}</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>CERTIFICATION</div>
            <div style={styles.detailValue}>{COURSE_NAMES[cert.course_id] || cert.course_id}</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>CERTIFICATE NUMBER</div>
            <div style={{ ...styles.detailValue, fontFamily: 'monospace', color: '#0A1F44', fontWeight: 700 }}>{cert.cert_number}</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>ISSUED</div>
            <div style={styles.detailValue}>{formatDate(cert.issued_at)}</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>EXPIRES</div>
            <div style={{ ...styles.detailValue, color: isExpired ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
              {formatDate(cert.expires_at)} {isExpired ? '(EXPIRED)' : ''}
            </div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>ISSUING ORGANIZATION</div>
            <div style={styles.detailValue}>National Safety Institute</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>COMPLIANT WITH</div>
            <div style={styles.detailValue}>OSHA 29 CFR 1926.453 · ANSI/SAIA A92.22 & A92.24 · CAN/CSA-B354.6:17</div>
          </div>
          <div style={styles.detailBox}>
            <div style={styles.detailLabel}>EXAM SCORE</div>
            <div style={{ ...styles.detailValue, color: '#16a34a', fontWeight: 700 }}>{cert.score}%</div>
          </div>
        </div>

        {/* Verified stamp */}
        <div style={styles.stamp}>
          <div style={styles.stampInner}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: 2 }}>VERIFIED BY</div>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>National Safety Institute</div>
            <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>NSICerts.org · {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div style={styles.footer}>
          This verification is provided by the National Safety Institute.<br />
          Questions? <a href="mailto:NSIcertsadmin@gmail.com" style={{ color: '#C9A84C' }}>NSIcertsadmin@gmail.com</a>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0A1F44 0%, #1a3a6e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    fontFamily: 'sans-serif',
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: '2rem',
    maxWidth: 640,
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    border: '4px solid #C9A84C',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoCircle: {
    width: 56, height: 56, borderRadius: '50%',
    background: '#0A1F44', border: '3px solid #C9A84C',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: { color: '#C9A84C', fontWeight: 700, fontSize: '1rem' },
  orgName: { fontWeight: 700, fontSize: '1rem', color: '#0A1F44' },
  orgSub: { fontSize: '0.75rem', color: '#C9A84C' },
  badge: {
    borderRadius: 12,
    padding: '1.5rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  badgeTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    letterSpacing: 1,
    margin: '0.5rem 0 0.25rem',
  },
  badgeSub: {
    fontSize: '0.85rem',
    color: '#555',
    lineHeight: 1.5,
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  detailBox: {
    background: '#f8fafc',
    borderRadius: 8,
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
  },
  detailLabel: {
    fontSize: '0.6rem',
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: '0.25rem',
  },
  detailValue: {
    fontSize: '0.9rem',
    color: '#1e293b',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  stamp: {
    background: '#0A1F44',
    borderRadius: 8,
    padding: '1rem',
    textAlign: 'center',
    color: '#C9A84C',
    marginBottom: '1rem',
  },
  stampInner: { display: 'flex', flexDirection: 'column', gap: '0.1rem' },
  footer: {
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#94a3b8',
    lineHeight: 1.6,
  },
}
