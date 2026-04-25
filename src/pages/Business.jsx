import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { supabase } from '../lib/supabase'

const COURSE_NAMES = {
  mewp:     'MEWP Operator Safety',
  forklift: 'Forklift Operator',
  fall:     'Fall Protection',
  hazcom:   'HazCom / GHS',
}

const COURSE_PRICES = { mewp: 39, forklift: 39, fall: 29, hazcom: 19 }

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(iso) {
  if (!iso) return null
  const diff = new Date(iso) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function Business() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('overview')
  const [business, setBusiness] = useState(null)
  const [employees, setEmployees] = useState([])
  const [certifications, setCertifications] = useState([])
  const [progress, setProgress] = useState([])
  const [promoDetails, setPromoDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [setupMode, setSetupMode] = useState(false)

  // Setup form
  const [setupForm, setSetupForm] = useState({ business_name: '', contact_email: '', promo_code: '' })
  const [setupError, setSetupError] = useState('')
  const [setupSaving, setSetupSaving] = useState(false)

  // Search
  const [search, setSearch] = useState('')

  useEffect(() => { loadDashboard() }, [user])

  const loadDashboard = async () => {
    setLoading(true)

    // Check if business account exists
    const { data: biz } = await supabase
      .from('business_accounts')
      .select('*')
      .eq('owner_user_id', user.id)
      .single()

    if (!biz) {
      setSetupMode(true)
      setLoading(false)
      return
    }

    setBusiness(biz)

    // Load promo code details
    if (biz.promo_code) {
      const { data: promo } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', biz.promo_code)
        .single()
      setPromoDetails(promo)
    }

    // Load employees via promo code usage
    // Find all users who used this promo code by looking at course_progress
    // For now, load business_employees table
    const { data: emps } = await supabase
      .from('business_employees')
      .select('*')
      .eq('business_id', biz.id)
      .order('invited_at', { ascending: false })
    setEmployees(emps || [])

    // Load certifications for all employees
    const empUserIds = (emps || []).filter(e => e.user_id).map(e => e.user_id)
    if (empUserIds.length > 0) {
      const { data: certs } = await supabase
        .from('certifications')
        .select('*')
        .in('user_id', empUserIds)
      setCertifications(certs || [])

      const { data: prog } = await supabase
        .from('course_progress')
        .select('*')
        .in('user_id', empUserIds)
      setProgress(prog || [])
    }

    setLoading(false)
  }

  const handleSetup = async () => {
    if (!setupForm.business_name.trim()) { setSetupError('Business name is required.'); return }
    if (!setupForm.promo_code.trim()) { setSetupError('Promo code is required. Contact NSI to get one.'); return }

    setSetupSaving(true)
    setSetupError('')

    // Validate promo code exists
    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', setupForm.promo_code.trim().toUpperCase())
      .single()

    if (!promo) {
      setSetupError('Promo code not found. Please contact NSI at NSIcertsadmin@gmail.com.')
      setSetupSaving(false)
      return
    }

    const { error } = await supabase.from('business_accounts').insert({
      owner_user_id: user.id,
      business_name: setupForm.business_name.trim(),
      contact_email: setupForm.contact_email.trim() || user.email,
      promo_code: setupForm.promo_code.trim().toUpperCase(),
    })

    setSetupSaving(false)
    if (error) { setSetupError('Error creating account: ' + error.message); return }
    setSetupMode(false)
    loadDashboard()
  }

  // Stats
  const totalEmployees = employees.length
  const enrolled = employees.filter(e => e.status !== 'invited').length
  const completed = certifications.length
  const expiringIn90 = certifications.filter(c => {
    const d = daysUntil(c.expires_at)
    return d !== null && d >= 0 && d <= 90
  }).length

  const getEmployeeData = (emp) => {
    const certs = certifications.filter(c => c.user_id === emp.user_id)
    const prog = progress.filter(p => p.user_id === emp.user_id)
    return { certs, prog }
  }

  const filteredEmployees = employees.filter(e =>
    !search || e.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  )

  // ── SETUP SCREEN ──
  if (setupMode) return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏢</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0B1629', fontFamily: 'sans-serif', marginBottom: '0.5rem' }}>Set Up Your Business Account</h1>
          <p style={{ color: '#6b7280', fontFamily: 'sans-serif', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Enter your business details and the promo code provided by NSI to get started tracking your team's certifications.
          </p>
        </div>

        <div style={card}>
          {setupError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>
              ⚠️ {setupError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={formLabel}>Business / Company Name *</label>
              <input
                value={setupForm.business_name}
                onChange={e => setSetupForm(p => ({ ...p, business_name: e.target.value }))}
                placeholder="Acme Construction LLC"
                style={formInput}
              />
            </div>
            <div>
              <label style={formLabel}>Contact Email</label>
              <input
                type="email"
                value={setupForm.contact_email}
                onChange={e => setSetupForm(p => ({ ...p, contact_email: e.target.value }))}
                placeholder={user?.email || 'your@email.com'}
                style={formInput}
              />
            </div>
            <div>
              <label style={formLabel}>NSI Promo Code *</label>
              <input
                value={setupForm.promo_code}
                onChange={e => setSetupForm(p => ({ ...p, promo_code: e.target.value.toUpperCase() }))}
                placeholder="e.g. ACME2026"
                style={{ ...formInput, textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem' }}
              />
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.35rem', fontFamily: 'sans-serif' }}>
                Don't have a code? <a href="mailto:NSIcertsadmin@gmail.com?subject=Business Account Request" style={{ color: '#0B1629', fontWeight: 600 }}>Contact NSI</a> for bulk pricing.
              </div>
            </div>

            <button
              onClick={handleSetup}
              disabled={setupSaving}
              style={{ ...primaryBtn, marginTop: '0.5rem', padding: '12px', fontSize: '1rem' }}
            >
              {setupSaving ? 'Setting up...' : 'Create Business Account →'}
            </button>
          </div>
        </div>

        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'sans-serif', marginTop: '1rem' }}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  )

  if (loading) return (
    <div style={pageStyle}>
      <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280', fontFamily: 'sans-serif' }}>Loading...</div>
    </div>
  )

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0B1629', fontFamily: 'sans-serif', marginBottom: '0.25rem' }}>
              🏢 {business?.business_name}
            </h1>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontFamily: 'sans-serif' }}>Business Dashboard · {user?.email}</div>
          </div>
          <button onClick={loadDashboard} style={ghostBtn}>↻ Refresh</button>
        </div>

        {/* Promo code banner */}
        {promoDetails && (
          <div style={{ background: '#0B1629', borderRadius: 12, padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'sans-serif', marginBottom: '0.25rem' }}>Your Team Promo Code</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.4rem', color: '#F5A623', letterSpacing: 2 }}>{promoDetails.code}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'sans-serif', marginTop: '0.25rem' }}>
                {promoDetails.discount_pct}% discount · {promoDetails.max_uses ? `${promoDetails.use_count || 0}/${promoDetails.max_uses} uses` : 'Unlimited uses'}
                {promoDetails.expires_at ? ` · Expires ${fmt(promoDetails.expires_at)}` : ''}
              </div>
            </div>
            <div style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#F5A623', fontFamily: 'sans-serif' }}>
              Share this code with your employees → they sign up at <strong>course.nsicerts.org</strong> and enter it at checkout
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Employees', value: totalEmployees, icon: '👥', color: '#2563eb' },
            { label: 'Enrolled', value: enrolled, icon: '📋', color: '#7c3aed' },
            { label: 'Certified', value: completed, icon: '🏆', color: '#16a34a' },
            { label: 'Expiring in 90 Days', value: expiringIn90, icon: '⚠️', color: expiringIn90 > 0 ? '#d97706' : '#6b7280' },
          ].map(s => (
            <div key={s.label} style={statCard}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, fontFamily: 'sans-serif', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'sans-serif', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', background: '#f1f5f9', borderRadius: 10, padding: '0.25rem', width: 'fit-content' }}>
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'employees', label: '👥 Employees' },
            { id: 'certs', label: '🏆 Certificates' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'sans-serif', fontSize: '0.85rem', fontWeight: 600,
              background: tab === t.id ? 'white' : 'transparent',
              color: tab === t.id ? '#0B1629' : '#6b7280',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* How to onboard */}
            <div style={card}>
              <h3 style={cardTitle}>How to Onboard Employees</h3>
              {[
                ['1', 'Share your promo code with employees', `Code: ${promoDetails?.code || '—'}`],
                ['2', 'Employees go to course.nsicerts.org and sign up', 'Takes 2 minutes'],
                ['3', 'They select their course and enter the promo code at checkout', `${promoDetails?.discount_pct || 0}% off applied automatically`],
                ['4', 'They complete the course and download their certificate', 'You\'ll see it here when done'],
              ].map(([num, title, sub]) => (
                <div key={num} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, background: '#0B1629', color: '#F5A623', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0, fontFamily: 'sans-serif' }}>{num}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0B1629', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>{title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'sans-serif', marginTop: '0.1rem' }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent completions */}
            <div style={card}>
              <h3 style={cardTitle}>Recent Completions</h3>
              {certifications.slice(0, 6).map((c, i) => {
                const emp = employees.find(e => e.user_id === c.user_id)
                const days = daysUntil(c.expires_at)
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9', fontFamily: 'sans-serif' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0B1629' }}>{c.holder_name || emp?.full_name || emp?.email || 'Employee'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{COURSE_NAMES[c.course_id] || c.course_id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: days !== null && days < 90 ? '#d97706' : '#16a34a', fontWeight: 600 }}>
                        {days !== null && days < 0 ? '⚠️ Expired' : days !== null && days < 90 ? `⚠️ ${days}d left` : '✅ Valid'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Expires {fmt(c.expires_at)}</div>
                    </div>
                  </div>
                )
              })}
              {certifications.length === 0 && <p style={emptyText}>No completions yet. Share your promo code to get started.</p>}
            </div>

            {/* Promo code usage */}
            <div style={{ ...card, gridColumn: '1 / -1' }}>
              <h3 style={cardTitle}>Promo Code Usage</h3>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0B1629', fontFamily: 'sans-serif' }}>{promoDetails?.use_count || 0}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', fontFamily: 'sans-serif' }}>Times Used</div>
                </div>
                {promoDetails?.max_uses && (
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0B1629', fontFamily: 'sans-serif' }}>{promoDetails.max_uses - (promoDetails.use_count || 0)}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', fontFamily: 'sans-serif' }}>Uses Remaining</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#16a34a', fontFamily: 'sans-serif' }}>{promoDetails?.discount_pct || 0}%</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', fontFamily: 'sans-serif' }}>Discount Applied</div>
                </div>
              </div>
              {promoDetails?.max_uses && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6b7280', fontFamily: 'sans-serif', marginBottom: '0.4rem' }}>
                    <span>Usage</span>
                    <span>{promoDetails.use_count || 0} / {promoDetails.max_uses}</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: 100, height: 8 }}>
                    <div style={{ background: '#0B1629', borderRadius: 100, height: 8, width: `${Math.min(100, ((promoDetails.use_count || 0) / promoDetails.max_uses) * 100)}%`, transition: 'width .3s' }} />
                  </div>
                </div>
              )}
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#6b7280', fontFamily: 'sans-serif' }}>
                Need more seats? <a href="mailto:NSIcertsadmin@gmail.com?subject=Add Seats to Business Account" style={{ color: '#0B1629', fontWeight: 600 }}>Contact NSI</a> to increase your limit.
              </div>
            </div>
          </div>
        )}

        {/* ── EMPLOYEES TAB ── */}
        {tab === 'employees' && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ ...cardTitle, marginBottom: 0 }}>Employees ({employees.length})</h3>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name or email..."
                style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: '0.85rem', fontFamily: 'sans-serif', outline: 'none', width: 240 }}
              />
            </div>

            {employees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
                <div style={{ fontWeight: 700, color: '#0B1629', fontFamily: 'sans-serif', marginBottom: '0.5rem' }}>No employees tracked yet</div>
                <div style={{ color: '#6b7280', fontFamily: 'sans-serif', fontSize: '0.85rem', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
                  When your employees sign up and use promo code <strong>{promoDetails?.code}</strong>, they'll appear here automatically.
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'sans-serif', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Name', 'Email', 'Course', 'Progress', 'Status', 'Cert Expiry'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp, i) => {
                      const { certs, prog } = getEmployeeData(emp)
                      const courseProgress = prog.find(p => p.course_id === emp.course_id)
                      const cert = certs.find(c => c.course_id === emp.course_id)
                      const chaptersCompleted = courseProgress?.completed_chapters?.length || 0
                      const pct = Math.round((chaptersCompleted / 8) * 100)
                      const days = cert ? daysUntil(cert.expires_at) : null

                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0B1629' }}>{emp.full_name || '—'}</td>
                          <td style={{ padding: '10px 12px', color: '#6b7280' }}>{emp.email}</td>
                          <td style={{ padding: '10px 12px', color: '#374151' }}>{COURSE_NAMES[emp.course_id] || '—'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            {courseProgress ? (
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#6b7280', marginBottom: 3 }}>
                                  <span>{pct}%</span>
                                </div>
                                <div style={{ background: '#f1f5f9', borderRadius: 100, height: 6, width: 100 }}>
                                  <div style={{ background: courseProgress.passed_final ? '#16a34a' : '#0B1629', borderRadius: 100, height: 6, width: `${pct}%` }} />
                                </div>
                              </div>
                            ) : <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Not started</span>}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{
                              padding: '3px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600,
                              background: courseProgress?.passed_final ? '#dcfce7' : courseProgress ? '#dbeafe' : '#f1f5f9',
                              color: courseProgress?.passed_final ? '#16a34a' : courseProgress ? '#1d4ed8' : '#6b7280',
                            }}>
                              {courseProgress?.passed_final ? '✅ Certified' : courseProgress ? '📖 In Progress' : '⏳ Not Started'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            {cert ? (
                              <span style={{ color: days !== null && days < 90 ? '#d97706' : '#16a34a', fontSize: '0.82rem', fontWeight: 600 }}>
                                {days !== null && days < 0 ? '⚠️ Expired' : fmt(cert.expires_at)}
                              </span>
                            ) : <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>—</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── CERTIFICATES TAB ── */}
        {tab === 'certs' && (
          <div style={card}>
            <h3 style={cardTitle}>Team Certificates ({certifications.length})</h3>
            {certifications.length === 0 ? (
              <p style={emptyText}>No certificates yet. Employees will appear here after completing their course.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'sans-serif', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Employee', 'Cert Number', 'Course', 'Score', 'Issued', 'Expires', 'Status', 'Verify'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {certifications.map((c, i) => {
                      const emp = employees.find(e => e.user_id === c.user_id)
                      const days = daysUntil(c.expires_at)
                      const expired = days !== null && days < 0
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0B1629' }}>{c.holder_name || emp?.full_name || '—'}</td>
                          <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '0.78rem', color: '#0B1629' }}>{c.cert_number}</td>
                          <td style={{ padding: '10px 12px', color: '#374151' }}>{COURSE_NAMES[c.course_id] || c.course_id}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: '#16a34a' }}>{c.score}%</td>
                          <td style={{ padding: '10px 12px', color: '#6b7280' }}>{fmt(c.issued_at)}</td>
                          <td style={{ padding: '10px 12px', color: expired ? '#dc2626' : days !== null && days < 90 ? '#d97706' : '#6b7280' }}>{fmt(c.expires_at)}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: expired ? '#fef2f2' : days !== null && days < 90 ? '#fff7ed' : '#dcfce7', color: expired ? '#dc2626' : days !== null && days < 90 ? '#d97706' : '#16a34a', padding: '2px 10px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600 }}>
                              {expired ? 'Expired' : days !== null && days < 90 ? `${days}d left` : 'Valid'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <a href={`https://course.nsicerts.org/verify/${c.cert_number}`} target="_blank" rel="noreferrer" style={{ color: '#0B1629', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
                              🔍 Verify
                            </a>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.78rem', color: '#9ca3af', fontFamily: 'sans-serif' }}>
          Need help? <a href="mailto:NSIcertsadmin@gmail.com" style={{ color: '#0B1629', fontWeight: 600 }}>NSIcertsadmin@gmail.com</a>
        </div>
      </div>
    </div>
  )
}

const pageStyle = { background: '#f1f5f9', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '4rem' }
const card = { background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '0' }
const statCard = { background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1.25rem', textAlign: 'center' }
const cardTitle = { fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem', fontFamily: 'sans-serif' }
const emptyText = { color: '#9ca3af', fontFamily: 'sans-serif', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }
const ghostBtn = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif', color: '#374151' }
const primaryBtn = { background: '#0B1629', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'sans-serif', width: '100%' }
const formLabel = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem', fontFamily: 'sans-serif' }
const formInput = { width: '100%', border: '1.5px solid #d1d5db', borderRadius: 8, padding: '10px 12px', fontSize: '0.9rem', fontFamily: 'sans-serif', outline: 'none', boxSizing: 'border-box' }
