import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthContext'
import { supabase } from '../lib/supabase'

// ── Only these emails can access admin ──
const ADMIN_EMAILS = ['NSIcertsadmin@gmail.com', 'nsicer tsadmin@gmail.com']

const COURSE_NAMES = {
  mewp:     'MEWP Operator',
  forklift: 'Forklift Operator',
  fall:     'Fall Protection',
  hazcom:   'HazCom / GHS',
}

const COURSE_PRICES = { mewp: 39, forklift: 39, fall: 29, hazcom: 19 }

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('overview')
  const [students, setStudents] = useState([])
  const [certifications, setCertifications] = useState([])
  const [progress, setProgress] = useState([])
  const [promoCodes, setPromoCodes] = useState([])
  const [loading, setLoading] = useState(true)

  // Promo form
  const [promoForm, setPromoForm] = useState({ code: '', discount_pct: '', description: '', expires_at: '' })
  const [promoSaving, setPromoSaving] = useState(false)
  const [promoMsg, setPromoMsg] = useState('')

  // Search
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return
    if (!ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email?.toLowerCase())) {
      navigate('/dashboard')
      return
    }
    loadAll()
  }, [user])

  const loadAll = async () => {
    setLoading(true)
    const [{ data: certs }, { data: prog }, { data: promos }] = await Promise.all([
      supabase.from('certifications').select('*').order('issued_at', { ascending: false }),
      supabase.from('course_progress').select('*').order('updated_at', { ascending: false }),
      supabase.from('promo_codes').select('*').order('created_at', { ascending: false }),
    ])
    setCertifications(certs || [])
    setProgress(prog || [])
    setPromoCodes(promos || [])
    setLoading(false)
  }

  // ── Stats ──
  const totalRevenue = progress
    .filter(p => p.paid)
    .reduce((sum, p) => sum + (COURSE_PRICES[p.course_id] || 0), 0)

  const totalStudents = new Set(progress.map(p => p.user_id)).size
  const totalCerts = certifications.length
  const totalEnrollments = progress.filter(p => p.paid).length

  const revenueByMonth = progress
    .filter(p => p.paid && p.paid_at)
    .reduce((acc, p) => {
      const month = new Date(p.paid_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      acc[month] = (acc[month] || 0) + (COURSE_PRICES[p.course_id] || 0)
      return acc
    }, {})

  const revenueByCourse = progress
    .filter(p => p.paid)
    .reduce((acc, p) => {
      const name = COURSE_NAMES[p.course_id] || p.course_id
      acc[name] = (acc[name] || 0) + (COURSE_PRICES[p.course_id] || 0)
      return acc
    }, {})

  // ── Promo handlers ──
  const savePromo = async () => {
    if (!promoForm.code || !promoForm.discount_pct) { setPromoMsg('Code and discount % are required.'); return }
    setPromoSaving(true)
    setPromoMsg('')
    const { error } = await supabase.from('promo_codes').insert({
      code: promoForm.code.toUpperCase().trim(),
      discount_pct: parseInt(promoForm.discount_pct),
      description: promoForm.description || null,
      expires_at: promoForm.expires_at || null,
      active: true,
    })
    setPromoSaving(false)
    if (error) { setPromoMsg('Error: ' + (error.message || 'Could not save.')); return }
    setPromoMsg('✅ Promo code created!')
    setPromoForm({ code: '', discount_pct: '', description: '', expires_at: '' })
    loadAll()
  }

  const togglePromo = async (id, active) => {
    await supabase.from('promo_codes').update({ active: !active }).eq('id', id)
    loadAll()
  }

  const deletePromo = async (id) => {
    if (!confirm('Delete this promo code?')) return
    await supabase.from('promo_codes').delete().eq('id', id)
    loadAll()
  }

  // ── Students table data ──
  const studentMap = progress.reduce((acc, p) => {
    if (!acc[p.user_id]) acc[p.user_id] = { user_id: p.user_id, courses: [] }
    acc[p.user_id].courses.push(p)
    return acc
  }, {})

  const certMap = certifications.reduce((acc, c) => {
    acc[`${c.user_id}_${c.course_id}`] = c
    return acc
  }, {})

  const studentRows = Object.values(studentMap).map(s => ({
    ...s,
    paid: s.courses.filter(c => c.paid).length,
    completed: s.courses.filter(c => c.passed_final).length,
    revenue: s.courses.filter(c => c.paid).reduce((sum, c) => sum + (COURSE_PRICES[c.course_id] || 0), 0),
    lastActive: s.courses.reduce((latest, c) => {
      const d = new Date(c.updated_at || 0)
      return d > latest ? d : latest
    }, new Date(0)),
  }))

  const filteredStudents = studentRows.filter(s =>
    !search || s.user_id.includes(search)
  )

  if (loading) return (
    <div style={pageStyle}>
      <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280', fontFamily: 'sans-serif' }}>
        Loading admin dashboard...
      </div>
    </div>
  )

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0B1629', fontFamily: 'sans-serif', marginBottom: '0.25rem' }}>
              NSI Admin Dashboard
            </h1>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', fontFamily: 'sans-serif' }}>
              Logged in as {user?.email}
            </div>
          </div>
          <button onClick={loadAll} style={ghostBtn}>↻ Refresh</button>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Revenue', value: `$${totalRevenue}`, icon: '💰', color: '#16a34a' },
            { label: 'Total Students', value: totalStudents, icon: '👥', color: '#2563eb' },
            { label: 'Enrollments', value: totalEnrollments, icon: '📋', color: '#7c3aed' },
            { label: 'Certificates Issued', value: totalCerts, icon: '🏆', color: '#d97706' },
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
            { id: 'students', label: '👥 Students' },
            { id: 'certs', label: '🏆 Certificates' },
            { id: 'promos', label: '🎟 Promo Codes' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: 'sans-serif', fontSize: '0.85rem', fontWeight: 600,
                background: tab === t.id ? 'white' : 'transparent',
                color: tab === t.id ? '#0B1629' : '#6b7280',
                boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* Revenue by month */}
            <div style={cardStyle}>
              <h3 style={cardTitle}>Revenue by Month</h3>
              {Object.keys(revenueByMonth).length === 0
                ? <p style={emptyText}>No revenue data yet.</p>
                : Object.entries(revenueByMonth).map(([month, amt]) => (
                  <div key={month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontFamily: 'sans-serif', fontSize: '0.85rem', color: '#374151' }}>{month}</span>
                    <span style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#16a34a' }}>${amt}</span>
                  </div>
                ))
              }
            </div>

            {/* Revenue by course */}
            <div style={cardStyle}>
              <h3 style={cardTitle}>Revenue by Course</h3>
              {Object.keys(revenueByCourse).length === 0
                ? <p style={emptyText}>No revenue data yet.</p>
                : Object.entries(revenueByCourse).map(([course, amt]) => (
                  <div key={course} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontFamily: 'sans-serif', fontSize: '0.85rem', color: '#374151' }}>{course}</span>
                    <span style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#16a34a' }}>${amt}</span>
                  </div>
                ))
              }
            </div>

            {/* Recent enrollments */}
            <div style={{ ...cardStyle, gridColumn: '1 / -1' }}>
              <h3 style={cardTitle}>Recent Enrollments</h3>
              {progress.filter(p => p.paid).slice(0, 10).map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9', fontFamily: 'sans-serif' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#0B1629', fontWeight: 600 }}>{COURSE_NAMES[p.course_id] || p.course_id}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>User: {p.user_id?.slice(0, 8)}...</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a' }}>${COURSE_PRICES[p.course_id] || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{fmt(p.paid_at)}</div>
                  </div>
                </div>
              ))}
              {progress.filter(p => p.paid).length === 0 && <p style={emptyText}>No enrollments yet.</p>}
            </div>
          </div>
        )}

        {/* ── STUDENTS TAB ── */}
        {tab === 'students' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ ...cardTitle, marginBottom: 0 }}>All Students ({studentRows.length})</h3>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by user ID..."
                style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: '0.85rem', fontFamily: 'sans-serif', outline: 'none', width: 240 }}
              />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'sans-serif', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['User ID', 'Courses Paid', 'Completed', 'Revenue', 'Last Active'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', color: '#374151', fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.user_id?.slice(0, 16)}...</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600 }}>{s.paid}</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ background: s.completed > 0 ? '#dcfce7' : '#f1f5f9', color: s.completed > 0 ? '#16a34a' : '#6b7280', padding: '2px 8px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600 }}>{s.completed}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#16a34a' }}>${s.revenue}</td>
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>{fmt(s.lastActive.toISOString())}</td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No students found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CERTIFICATES TAB ── */}
        {tab === 'certs' && (
          <div style={cardStyle}>
            <h3 style={cardTitle}>Certificates Issued ({certifications.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'sans-serif', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Cert Number', 'Course', 'Holder', 'Score', 'Issued', 'Expires', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {certifications.map((c, i) => {
                    const expired = new Date(c.expires_at) < new Date()
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#0B1629', fontWeight: 600 }}>{c.cert_number}</td>
                        <td style={{ padding: '10px 12px', color: '#374151' }}>{COURSE_NAMES[c.course_id] || c.course_id}</td>
                        <td style={{ padding: '10px 12px', color: '#374151' }}>{c.holder_name || '—'}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: c.score >= 80 ? '#16a34a' : '#dc2626' }}>{c.score}%</td>
                        <td style={{ padding: '10px 12px', color: '#6b7280' }}>{fmt(c.issued_at)}</td>
                        <td style={{ padding: '10px 12px', color: '#6b7280' }}>{fmt(c.expires_at)}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ background: expired ? '#fef2f2' : '#dcfce7', color: expired ? '#dc2626' : '#16a34a', padding: '2px 10px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600 }}>
                            {expired ? 'Expired' : 'Valid'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  {certifications.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No certificates issued yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PROMO CODES TAB ── */}
        {tab === 'promos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Create new promo */}
            <div style={cardStyle}>
              <h3 style={cardTitle}>Create Promo Code</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {[
                  { label: 'Code', key: 'code', placeholder: 'SAVE20', type: 'text' },
                  { label: 'Discount %', key: 'discount_pct', placeholder: '20', type: 'number' },
                  { label: 'Description', key: 'description', placeholder: 'Optional note', type: 'text' },
                  { label: 'Expires (optional)', key: 'expires_at', placeholder: '', type: 'date' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={formLabel}>{f.label}</label>
                    <input
                      type={f.type}
                      value={promoForm[f.key]}
                      placeholder={f.placeholder}
                      onChange={e => setPromoForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={formInput}
                    />
                  </div>
                ))}
              </div>
              {promoMsg && <div style={{ marginBottom: '0.75rem', fontSize: '0.85rem', color: promoMsg.startsWith('✅') ? '#16a34a' : '#dc2626', fontFamily: 'sans-serif' }}>{promoMsg}</div>}
              <button onClick={savePromo} disabled={promoSaving} style={primaryBtn}>
                {promoSaving ? 'Saving...' : '+ Create Promo Code'}
              </button>
            </div>

            {/* Existing promo codes */}
            <div style={cardStyle}>
              <h3 style={cardTitle}>Active & Inactive Codes ({promoCodes.length})</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'sans-serif', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Code', 'Discount', 'Description', 'Expires', 'Uses', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.map((p, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: '#0B1629' }}>{p.code}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#7c3aed' }}>{p.discount_pct}% off</td>
                        <td style={{ padding: '10px 12px', color: '#6b7280' }}>{p.description || '—'}</td>
                        <td style={{ padding: '10px 12px', color: '#6b7280' }}>{p.expires_at ? fmt(p.expires_at) : 'Never'}</td>
                        <td style={{ padding: '10px 12px', color: '#6b7280' }}>{p.use_count || 0}{p.max_uses ? `/${p.max_uses}` : ''}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ background: p.active ? '#dcfce7' : '#f1f5f9', color: p.active ? '#16a34a' : '#6b7280', padding: '2px 10px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600 }}>
                            {p.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => togglePromo(p.id, p.active)} style={smallBtn}>
                              {p.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => deletePromo(p.id)} style={{ ...smallBtn, color: '#dc2626', borderColor: '#fecaca' }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {promoCodes.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No promo codes yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

const pageStyle = { background: '#f1f5f9', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '4rem' }
const cardStyle = { background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '0' }
const statCard = { background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1.25rem', textAlign: 'center' }
const cardTitle = { fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: '1rem', fontFamily: 'sans-serif' }
const emptyText = { color: '#9ca3af', fontFamily: 'sans-serif', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }
const ghostBtn = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif', color: '#374151' }
const primaryBtn = { background: '#0B1629', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'sans-serif' }
const smallBtn = { background: 'white', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif', color: '#374151' }
const formLabel = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem', fontFamily: 'sans-serif' }
const formInput = { width: '100%', border: '1.5px solid #d1d5db', borderRadius: 8, padding: '9px 12px', fontSize: '0.9rem', fontFamily: 'sans-serif', outline: 'none', boxSizing: 'border-box' }
