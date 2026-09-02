import { useState, useEffect, useRef } from 'react'
import { useContent } from '../context/ContentProvider'
import * as db from '../lib/db'
import { supabase, loginOwner, logoutOwner, changeOwnerPassword, onAuthChange } from '../lib/supabase'
import defaultContent from '../data/defaultContent'
import './OwnerPanel.css'

// ─────────────────────────────────────────────────────────────────────────────
//  OWNER PANEL — Secret URL: /kgadmin-9x2
//
//  SECURITY:
//  • Login uses Supabase Auth (email + password stored in Supabase)
//  • Session is stored securely by Supabase SDK — persists across refreshes
//  • Works from ANY device — open URL, enter email+password, see latest data
//  • Members table is BLOCKED for non-authenticated users (RLS)
//  • Enquiries can be inserted by anyone but read ONLY by authenticated owner
//  • Password change goes through Supabase Auth (not localStorage)
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'dashboard',  icon: '🏠', label: 'Dashboard'      },
  { id: 'members',    icon: '👥', label: 'Members'         },
  { id: 'enquiries',  icon: '📧', label: 'Enquiries'       },
  { id: 'hero',       icon: '🎯', label: 'Hero Section'    },
  { id: 'gyminfo',    icon: 'ℹ️',  label: 'Gym Info'        },
  { id: 'stats',      icon: '📊', label: 'Stats'           },
  { id: 'owner',      icon: '👤', label: 'Owner Profile'   },
  { id: 'story',      icon: '📖', label: 'Gym Story'       },
  { id: 'results',    icon: '💪', label: 'Results'         },
  { id: 'gallery',    icon: '📸', label: 'Gallery'         },
  { id: 'trophies',   icon: '🏆', label: 'Trophies'        },
  { id: 'membership', icon: '💳', label: 'Membership Plans'},
  { id: 'security',   icon: '🔒', label: 'Security'        },
]

export default function OwnerPanel() {
  const [session,   setSession]   = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [tab,       setTab]       = useState('dashboard')
  const [sideOpen,  setSideOpen]  = useState(false)

  // Listen for auth state — works on any device, any browser
  useEffect(() => {
    // Get current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthLoading(false)
    })
    // Subscribe to future auth changes (login/logout)
    const { data: { subscription } } = onAuthChange((_event, session) => {
      setSession(session)
      setAuthLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (authLoading) {
    return (
      <div style={{minHeight:'100vh',background:'#060606',display:'flex',alignItems:'center',
        justifyContent:'center',color:'var(--red)',fontFamily:'sans-serif',
        fontSize:'12px',letterSpacing:'5px',textTransform:'uppercase'}}>
        Checking session…
      </div>
    )
  }

  if (!session) return <LoginScreen />

  const handleLogout = async () => {
    await logoutOwner()
    // session state updates via onAuthChange listener above
  }

  return (
    <div className="op-wrap">
      <aside className={`op-sidebar ${sideOpen ? 'open' : ''}`}>
        <div className="op-logo">
          <span className="op-ko">KO</span>
          <span className="op-admin">Admin</span>
        </div>
        <nav className="op-nav">
          {TABS.map(t => (
            <button key={t.id} className={`op-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => { setTab(t.id); setSideOpen(false) }}>
              <span className="op-tab-icon">{t.icon}</span>
              <span className="op-tab-label">{t.label}</span>
            </button>
          ))}
        </nav>
        <button className="op-logout" onClick={handleLogout}>Logout →</button>
      </aside>

      <div className="op-main">
        <div className="op-topbar">
          <button className="op-burger" onClick={() => setSideOpen(v => !v)}>☰</button>
          <span className="op-page-title">{TABS.find(t => t.id === tab)?.label}</span>
          <span className="op-gym-name">Knockout Gym Panel</span>
        </div>
        <div className="op-content">
          {tab === 'dashboard'  && <TabDashboard setTab={setTab} />}
          {tab === 'members'    && <TabMembers />}
          {tab === 'enquiries'  && <TabEnquiries />}
          {tab === 'hero'       && <TabHero />}
          {tab === 'gyminfo'    && <TabGymInfo />}
          {tab === 'stats'      && <TabStats />}
          {tab === 'owner'      && <TabOwner />}
          {tab === 'story'      && <TabStory />}
          {tab === 'results'    && <TabResults />}
          {tab === 'gallery'    && <TabGallery />}
          {tab === 'trophies'   && <TabTrophies />}
          {tab === 'membership' && <TabMembership />}
          {tab === 'security'   && <TabSecurity />}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN SCREEN — Supabase Auth (email + password)
//  Works from ANY device. Shows latest data after login.
// ─────────────────────────────────────────────────────────────────────────────
function LoginScreen() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [shake,    setShake]    = useState(false)

  const doLogin = async () => {
    if (!email.trim() || !password) { setError('Enter your email and password.'); return }
    setLoading(true); setError('')
    const { error: err } = await loginOwner(email.trim(), password)
    if (err) {
      setError('Wrong email or password. Try again.')
      setShake(true); setTimeout(() => setShake(false), 600)
    }
    // If success: onAuthChange listener in parent sets session automatically
    setLoading(false)
  }

  const onKey = (e) => { if (e.key === 'Enter') doLogin() }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <span style={{fontFamily:'var(--font-display)',fontSize:'64px',color:'var(--text)',letterSpacing:'4px'}}>KO</span>
          <p style={{fontSize:'11px',letterSpacing:'5px',color:'var(--text-muted)',textTransform:'uppercase',marginTop:'8px'}}>Owner Access</p>
        </div>

        <div className={`login-field ${shake ? 'shake' : ''}`}>
          <input
            type="email"
            placeholder="owner@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            onKeyDown={onKey}
            className={error ? 'error' : ''}
            autoComplete="email"
          />
        </div>

        <div className={`login-field ${shake ? 'shake' : ''}`}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            onKeyDown={onKey}
            className={error ? 'error' : ''}
            autoComplete="current-password"
          />
        </div>

        {error && <p className="login-err">{error}</p>}

        <button className="btn-red login-btn" onClick={doLogin} disabled={loading}>
          {loading ? 'Checking…' : 'Open Panel →'}
        </button>

        <p className="login-hint">
          Use the email and password you set up in Supabase.<br/>
          Forgot password? See Security tab after logging in, or reset in Supabase dashboard.
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function TabDashboard({ setTab }) {
  const [members,   setMembers]   = useState([])
  const [enquiries, setEnquiries] = useState([])

  useEffect(() => {
    db.getMembers().then(setMembers)
    db.getEnquiries().then(setEnquiries)
  }, [])

  const active   = members.filter(m => {
    if (m.status === 'paused') return false
    return Math.ceil((new Date(m.enddate||m.endDate) - new Date()) / 86400000) >= 0
  }).length
  const expiring = members.filter(m => {
    const d = Math.ceil((new Date(m.enddate||m.endDate) - new Date()) / 86400000)
    return d >= 0 && d <= 7 && m.status !== 'paused'
  }).length

  const cards = [
    { label:'Total Members',  value: members.length,    sub:`${active} active`,       tab:'members',   color:'red'  },
    { label:'Expiring Soon',  value: expiring,           sub:'in next 7 days',         tab:'members',   color:'gold' },
    { label:'Enquiries',      value: enquiries.length,   sub:'from contact form',      tab:'enquiries', color:'red'  },
    { label:'Google Rating',  value: '4.9★',            sub:'364 reviews',            tab:'gyminfo',   color:'gold' },
  ]

  return (
    <div>
      <h2 className="op-section-title">Welcome Back 👋</h2>
      <p className="op-section-sub">Gym data is live from the cloud. Changes you make reflect everywhere instantly.</p>
      <div className="dash-cards">
        {cards.map((c,i) => (
          <button key={i} className={`dash-card dash-${c.color}`} onClick={() => setTab(c.tab)}>
            <span className="dash-val">{c.value}</span>
            <span className="dash-label">{c.label}</span>
            <span className="dash-sub">{c.sub}</span>
          </button>
        ))}
      </div>
      <h3 className="op-section-title" style={{fontSize:'18px',marginBottom:'16px'}}>Edit Sections</h3>
      <div className="quick-actions">
        {TABS.slice(3).map(t => (
          <button key={t.id} className="quick-btn" onClick={() => setTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MEMBERS TAB
// ─────────────────────────────────────────────────────────────────────────────
function TabMembers() {
  const { content }   = useContent()
  const planNames     = (content?.membership || []).map(p => p.name)
  const [members,  setMembers]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')
  const [modal,    setModal]    = useState(null)
  const [selected, setSelected] = useState(null)
  const [form,     setForm]     = useState({})
  const [toast,    setToast]    = useState('')

  useEffect(() => { db.getMembers().then(d => { setMembers(d); setLoading(false) }) }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const daysLeft = m => Math.ceil((new Date(m.enddate||m.endDate) - new Date()) / 86400000)
  const statusOf = m => {
    if (m.status === 'paused') return 'paused'
    const d = daysLeft(m)
    if (d < 0)  return 'expired'
    if (d <= 7) return 'expiring'
    return 'active'
  }

  const filtered = members.filter(m => {
    const st = statusOf(m)
    if (filter === 'active'   && !['active','expiring'].includes(st)) return false
    if (filter === 'expiring' && st !== 'expiring')  return false
    if (filter === 'expired'  && st !== 'expired')   return false
    if (filter === 'paused'   && st !== 'paused')    return false
    const q = search.toLowerCase()
    return !q || (m.name||'').toLowerCase().includes(q) || (m.phone||'').includes(q)
  })

  const blank = { name:'', phone:'', plan:'Standard', startDate: new Date().toISOString().slice(0,10), endDate:'', amountPaid:'', notes:'' }

  const submitAdd = async () => {
    if (!form.name || !form.phone || !form.endDate) { showToast('Fill name, phone & end date.'); return }
    showToast('Adding…')
    const saved = await db.saveMember({
      name: form.name, phone: form.phone, plan: form.plan||'Standard',
      startdate: form.startDate, enddate: form.endDate,
      amountpaid: form.amountPaid||'', notes: form.notes||'',
      status: 'active',
      history: [{ action:'Joined', date: new Date().toISOString(), note:'Added by owner' }]
    })
    if (saved) { setMembers(p => [saved, ...p]); showToast('Member added ✓') }
    else showToast('Error — try again')
    setModal(null)
  }

  const submitEdit = async () => {
    showToast('Saving…')
    const saved = await db.saveMember({
      ...selected,
      name: form.name, phone: form.phone, plan: form.plan,
      startdate: form.startDate || selected.startdate,
      enddate: form.endDate || selected.enddate,
      amountpaid: form.amountPaid || selected.amountpaid,
      notes: form.notes || ''
    })
    if (saved) { setMembers(p => p.map(m => m.id === selected.id ? saved : m)); showToast('Saved ✓') }
    setModal(null)
  }

  const submitExtend = async () => {
    const months = parseInt(form.months) || 1
    const base   = new Date(selected.enddate < new Date().toISOString().slice(0,10)
      ? new Date() : selected.enddate)
    base.setMonth(base.getMonth() + months)
    const newEnd = base.toISOString().slice(0,10)
    showToast('Extending…')
    const saved = await db.saveMember({
      ...selected,
      enddate: newEnd,
      status: 'active',
      history: [...(selected.history||[]), {
        action: `Extended +${months} month${months>1?'s':''}`,
        date: new Date().toISOString(),
        note: form.note || `Paid ₹${form.paid||''}`
      }]
    })
    if (saved) { setMembers(p => p.map(m => m.id === selected.id ? saved : m)); showToast('Extended ✓') }
    setModal(null)
  }

  const doDelete = async (id) => {
    if (!confirm('Delete member permanently?')) return
    await db.deleteMember(id)
    setMembers(p => p.filter(m => m.id !== id))
    showToast('Deleted.')
  }

  const togglePause = async (m) => {
    const saved = await db.saveMember({ ...m, status: m.status === 'paused' ? 'active' : 'paused' })
    if (saved) setMembers(p => p.map(x => x.id === m.id ? saved : x))
  }

  const exportCSV = () => {
    const rows = ['Name,Phone,Plan,Start,End,Paid,Status,Notes',
      ...members.map(m => `"${m.name}","${m.phone}","${m.plan}","${m.startdate}","${m.enddate}","${m.amountpaid}","${statusOf(m)}","${m.notes||''}"`)
    ].join('\n')
    const a = Object.assign(document.createElement('a'),{
      href: URL.createObjectURL(new Blob([rows],{type:'text/csv'})),
      download: 'kg-members.csv'
    }); a.click()
  }

  const ST = { active:'green', expiring:'gold', expired:'red', paused:'muted' }

  return (
    <div>
      {toast && <div className="op-toast">{toast}</div>}
      {loading && <p className="op-hint">Loading members from database…</p>}

      <div className="op-toolbar">
        <input className="op-search" placeholder="Search by name or phone…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="op-filter-group">
          {['all','active','expiring','expired','paused'].map(f => (
            <button key={f} className={`op-filter-btn ${filter===f?'active':''}`} onClick={()=>setFilter(f)}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn-red" onClick={() => { setForm(blank); setModal('add') }}>+ Add Member</button>
        <button className="btn-outline" onClick={exportCSV}>↓ CSV</button>
      </div>

      <div className="member-list">
        {filtered.length === 0 && !loading && <p className="op-empty">No members found.</p>}
        {filtered.map(m => {
          const st = statusOf(m)
          const dl = daysLeft(m)
          return (
            <div key={m.id} className="member-row">
              <div className="mem-row-main" onClick={() => { setSelected(m); setModal('view') }}>
                <div className="mem-row-info">
                  <span className="mem-row-name">{m.name}</span>
                  <span className="mem-row-phone">{m.phone}</span>
                </div>
                <div className="mem-row-plan">
                  <span className="mem-badge-plan">{m.plan}</span>
                  <span className={`mem-status mem-status-${ST[st]}`}>
                    {st==='expiring' ? `⚠ ${dl}d left`
                     : st==='expired' ? 'Expired'
                     : st==='paused'  ? 'Paused'
                     : `✓ ${dl}d left`}
                  </span>
                </div>
                <div className="mem-row-dates">
                  <span>{m.startdate} → {m.enddate}</span>
                  {m.amountpaid && <span className="mem-amount-paid">₹{m.amountpaid}</span>}
                </div>
              </div>
              <div className="mem-row-actions">
                <button className="mem-act-btn" onClick={() => { setSelected(m); setForm({months:'1'}); setModal('extend') }}>⟳ Extend</button>
                <button className="mem-act-btn" onClick={() => {
                  setSelected(m)
                  setForm({ name:m.name, phone:m.phone, plan:m.plan, startDate:m.startdate, endDate:m.enddate, amountPaid:m.amountpaid, notes:m.notes||'' })
                  setModal('edit')
                }}>✎ Edit</button>
                <button className="mem-act-btn" onClick={() => togglePause(m)}>{m.status==='paused'?'▶ Resume':'⏸ Pause'}</button>
                <button className="mem-act-btn red" onClick={() => doDelete(m.id)}>✕</button>
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <div className="op-modal-bg" onClick={() => setModal(null)}>
          <div className="op-modal" onClick={e => e.stopPropagation()}>

            {/* ADD / EDIT */}
            {(modal === 'add' || modal === 'edit') && (<>
              <h3 className="modal-title">{modal==='add' ? 'Add New Member' : 'Edit Member'}</h3>
              <div className="op-row">
                <OpField label="Full Name *"><input value={form.name||''} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Arjun Sharma" /></OpField>
                <OpField label="Phone *"><input value={form.phone||''} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="9876543210" /></OpField>
              </div>
              <div className="op-row">
                <OpField label="Plan">
                  <select value={form.plan||'Standard'} onChange={e=>setForm(p=>({...p,plan:e.target.value}))}>
                    {planNames.length ? planNames.map(n=><option key={n}>{n}</option>) : <><option>Basic</option><option>Standard</option><option>Premium</option></>}
                  </select>
                </OpField>
                <OpField label="Amount Paid (₹)"><input type="number" value={form.amountPaid||''} onChange={e=>setForm(p=>({...p,amountPaid:e.target.value}))} placeholder="1500" /></OpField>
              </div>
              <div className="op-row">
                <OpField label="Start Date"><input type="date" value={form.startDate||''} onChange={e=>setForm(p=>({...p,startDate:e.target.value}))} /></OpField>
                <OpField label="End Date *"><input type="date" value={form.endDate||''} onChange={e=>setForm(p=>({...p,endDate:e.target.value}))} /></OpField>
              </div>
              <OpField label="Notes"><textarea rows={2} value={form.notes||''} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Any notes about this member…" /></OpField>
              <div className="modal-btns">
                <button className="btn-red" onClick={modal==='add' ? submitAdd : submitEdit}>Save Member</button>
                <button className="btn-outline" onClick={()=>setModal(null)}>Cancel</button>
              </div>
            </>)}

            {/* EXTEND */}
            {modal === 'extend' && (<>
              <h3 className="modal-title">Extend — {selected?.name}</h3>
              <p className="modal-info">Current end: <strong>{selected?.enddate}</strong></p>
              <div className="op-row">
                <OpField label="Extend by (months)"><input type="number" min="1" max="24" value={form.months||'1'} onChange={e=>setForm(p=>({...p,months:e.target.value}))} /></OpField>
                <OpField label="Amount Received (₹)"><input placeholder="1500" value={form.paid||''} onChange={e=>setForm(p=>({...p,paid:e.target.value}))} /></OpField>
              </div>
              <OpField label="Note (optional)"><input placeholder="Paid cash / UPI" value={form.note||''} onChange={e=>setForm(p=>({...p,note:e.target.value}))} /></OpField>
              <p className="modal-info" style={{color:'var(--gold)'}}>
                New end date: {(()=>{
                  const d=new Date(selected?.enddate < new Date().toISOString().slice(0,10) ? new Date() : selected?.enddate)
                  d.setMonth(d.getMonth()+(parseInt(form.months)||1))
                  return d.toISOString().slice(0,10)
                })()}
              </p>
              <div className="modal-btns">
                <button className="btn-red" onClick={submitExtend}>Extend Membership</button>
                <button className="btn-outline" onClick={()=>setModal(null)}>Cancel</button>
              </div>
            </>)}

            {/* VIEW HISTORY */}
            {modal === 'view' && (<>
              <h3 className="modal-title">{selected?.name}</h3>
              <p className="modal-info">{selected?.phone} · {selected?.plan} · ₹{selected?.amountpaid}</p>
              <p className="modal-info">{selected?.startdate} → {selected?.enddate}</p>
              {selected?.notes && <p className="modal-info" style={{fontStyle:'italic'}}>{selected.notes}</p>}
              <h4 style={{margin:'24px 0 12px',fontSize:'11px',color:'var(--text-muted)',letterSpacing:'3px',textTransform:'uppercase'}}>History</h4>
              {(selected?.history||[]).map((h,i)=>(
                <div key={i} className="hist-row">
                  <span className="hist-action">{h.action}</span>
                  <span className="hist-date">{(h.date||'').slice(0,10)}</span>
                  {h.note && <span className="hist-note">{h.note}</span>}
                </div>
              ))}
              <button className="btn-outline" style={{marginTop:'24px'}} onClick={()=>setModal(null)}>Close</button>
            </>)}

          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  ENQUIRIES TAB
// ─────────────────────────────────────────────────────────────────────────────
function TabEnquiries() {
  const [enquiries, setEnquiries] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => { db.getEnquiries().then(d => { setEnquiries(d); setLoading(false) }) }, [])

  const del = async (id) => {
    await db.deleteEnquiry(id)
    setEnquiries(p => p.filter(e => e.id !== id))
  }

  const exportCSV = () => {
    const rows = ['Name,Phone,Message,Date',
      ...enquiries.map(e => `"${e.name}","${e.phone}","${e.message||''}","${(e.created_at||'').slice(0,16).replace('T',' ')}"`)
    ].join('\n')
    const a = Object.assign(document.createElement('a'),{
      href: URL.createObjectURL(new Blob([rows],{type:'text/csv'})),
      download: 'kg-enquiries.csv'
    }); a.click()
  }

  return (
    <div>
      <div className="op-toolbar">
        <span style={{color:'var(--text-muted)',fontSize:'14px'}}>{enquiries.length} enquiry{enquiries.length!==1?'s':''} received</span>
        <button className="btn-outline" onClick={exportCSV}>↓ Export CSV</button>
      </div>
      {loading && <p className="op-hint">Loading from database…</p>}
      {!loading && enquiries.length === 0 && <p className="op-empty">No enquiries yet. They appear here when someone fills the contact form on the website.</p>}
      {enquiries.map(e => (
        <div key={e.id} className="enq-row">
          <div className="enq-main">
            <span className="enq-name">{e.name}</span>
            <span className="enq-phone">{e.phone}</span>
            <span className="enq-date">{(e.created_at||'').slice(0,16).replace('T',' ')}</span>
          </div>
          {e.message && <p className="enq-msg">{e.message}</p>}
          <button className="mem-act-btn red" style={{marginTop:'8px'}} onClick={() => del(e.id)}>✕ Delete</button>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  HERO SECTION TAB
// ─────────────────────────────────────────────────────────────────────────────
function TabHero() {
  const { content, updateSection } = useContent()
  const [form, setForm] = useState({ ...content.hero })
  const [toast, setToast] = useState('')
  const set  = (k,v) => setForm(p=>({...p,[k]:v}))
  const save = async () => { const ok = await updateSection('hero', form); setToast(ok ? 'Saved ✓' : 'Error — try again'); setTimeout(()=>setToast(''),2500) }

  return (
    <div>
      {toast && <div className="op-toast">{toast}</div>}
      <ImageField
        label="HERO BACKGROUND VIDEO"
        description="🎬 Plays full-screen behind the big heading on your HOME page. Best: 15–30 second gym clip, MP4 format, landscape. To use your own video: copy it into public/videos/hero.mp4, push to GitHub, then type /videos/hero.mp4 here."
        instructions={['1. Record gym video on your phone (landscape, 15-30 sec)', '2. In Termux: copy to knockout-gym/public/videos/hero.mp4', '3. Run: git add . && git commit -m "hero video" && git push', '4. Vercel auto-deploys. Then type /videos/hero.mp4 below.', 'OR: paste any direct public MP4 link.']}
        isVideo value={form.videoUrl||''} onChange={v=>set('videoUrl',v)} />
      <ImageField
        label="HERO BACKGROUND IMAGE (shown when no video is set)"
        description="🖼️ Full-screen background on HOME page hero. Used when video URL is empty. Use a wide, dramatic gym photo. Minimum 1920×1080px recommended."
        value={form.bgImage||''} onChange={v=>set('bgImage',v)} />
      <div className="op-row">
        <OpField label="Big Heading — Line 1"><input value={form.line1||''} onChange={e=>set('line1',e.target.value)} placeholder="WHERE CHAMPIONS" /></OpField>
        <OpField label="Big Heading — Line 2"><input value={form.line2||''} onChange={e=>set('line2',e.target.value)} placeholder="ARE FORGED." /></OpField>
      </div>
      <OpField label="Subtext (small text under heading)"><input value={form.subtext||''} onChange={e=>set('subtext',e.target.value)} /></OpField>
      <OpField label="Button Text"><input value={form.ctaText||''} onChange={e=>set('ctaText',e.target.value)} placeholder="Join Now" /></OpField>
      <SaveBtn onClick={save} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  GYM INFO TAB
// ─────────────────────────────────────────────────────────────────────────────
function TabGymInfo() {
  const { content, updateSection } = useContent()
  const [form, setForm] = useState({ ...content.gym })
  const [toast, setToast] = useState('')
  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const setH = (k,v) => setForm(p=>({...p, hours:{...p.hours,[k]:v}}))
  const save = async () => { const ok = await updateSection('gym', form); setToast(ok?'Saved ✓':'Error'); setTimeout(()=>setToast(''),2500) }

  return (
    <div>
      {toast && <div className="op-toast">{toast}</div>}
      <div className="op-row">
        <OpField label="Gym Name"><input value={form.name||''} onChange={e=>set('name',e.target.value)} /></OpField>
        <OpField label="Tagline"><input value={form.tagline||''} onChange={e=>set('tagline',e.target.value)} /></OpField>
      </div>
      <OpField label="Full Address"><textarea rows={2} value={form.address||''} onChange={e=>set('address',e.target.value)} /></OpField>
      <div className="op-row">
        <OpField label="Phone Number"><input value={form.phone||''} onChange={e=>set('phone',e.target.value)} /></OpField>
        <OpField label="Email"><input value={form.email||''} onChange={e=>set('email',e.target.value)} /></OpField>
      </div>
      <div className="op-row">
        <OpField label="Google Rating (e.g. 4.9)"><input value={form.rating||''} onChange={e=>set('rating',e.target.value)} /></OpField>
        <OpField label="Total Reviews (e.g. 364)"><input value={form.reviews||''} onChange={e=>set('reviews',e.target.value)} /></OpField>
      </div>
      <div className="op-row">
        <OpField label="Weekday Hours"><input value={form.hours?.weekdays||''} onChange={e=>setH('weekdays',e.target.value)} placeholder="5:30 AM – 10:00 PM" /></OpField>
        <OpField label="Sunday"><input value={form.hours?.sunday||''} onChange={e=>setH('sunday',e.target.value)} placeholder="Closed" /></OpField>
      </div>
      <div className="op-row">
        <OpField label="Instagram (no @)"><input value={form.instagram||''} onChange={e=>set('instagram',e.target.value)} placeholder="knockoutgymzirakpur" /></OpField>
        <OpField label="Facebook URL"><input value={form.facebook||''} onChange={e=>set('facebook',e.target.value)} /></OpField>
      </div>
      <OpField label="WhatsApp (country code + number, no +)" hint="Example: 918582859970  (91 = India, then phone number without 0)">
        <input value={form.whatsapp||''} onChange={e=>set('whatsapp',e.target.value)} />
      </OpField>
      <OpField label="Google Maps Embed URL" hint="Google Maps → Search your gym → Share → Embed a map → copy the URL inside src=&quot;...&quot;">
        <textarea rows={3} value={form.mapEmbed||''} onChange={e=>set('mapEmbed',e.target.value)} />
      </OpField>
      <SaveBtn onClick={save} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  STATS TAB
// ─────────────────────────────────────────────────────────────────────────────
function TabStats() {
  const { content, updateSection } = useContent()
  const [stats, setStats] = useState([...content.stats])
  const [toast, setToast] = useState('')
  const upd  = (i,k,v) => setStats(p => p.map((s,j) => j===i ? {...s,[k]:v} : s))
  const save = async () => { const ok = await updateSection('stats', stats); setToast(ok?'Saved ✓':'Error'); setTimeout(()=>setToast(''),2500) }

  return (
    <div>
      {toast && <div className="op-toast">{toast}</div>}
      <p className="op-hint">4 numbers shown in the counter section on the home page.</p>
      {stats.map((s,i) => (
        <div key={i} className="op-row">
          <OpField label={`Number ${i+1}`}><input value={s.value} onChange={e=>upd(i,'value',e.target.value)} /></OpField>
          <OpField label="Suffix (e.g. + or ★)"><input value={s.suffix} onChange={e=>upd(i,'suffix',e.target.value)} style={{maxWidth:'100px'}} /></OpField>
          <OpField label="Label below number"><input value={s.label} onChange={e=>upd(i,'label',e.target.value)} /></OpField>
        </div>
      ))}
      <SaveBtn onClick={save} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  OWNER PROFILE TAB
// ─────────────────────────────────────────────────────────────────────────────
function TabOwner() {
  const { content, updateSection } = useContent()
  const [form, setForm] = useState({ ...content.owner, achievements: [...(content.owner.achievements||[])] })
  const [toast, setToast] = useState('')
  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const save = async () => { const ok = await updateSection('owner', form); setToast(ok?'Saved ✓':'Error'); setTimeout(()=>setToast(''),2500) }
  const updAch = (i,k,v) => setForm(p=>({...p, achievements: p.achievements.map((a,j)=>j===i?{...a,[k]:v}:a)}))
  const addAch = () => setForm(p=>({...p, achievements:[...(p.achievements||[]),{title:'',year:''}]}))
  const delAch = (i) => setForm(p=>({...p, achievements: p.achievements.filter((_,j)=>j!==i)}))

  return (
    <div>
      {toast && <div className="op-toast">{toast}</div>}
      <ImageField
        label="OWNER PROFILE PHOTO"
        description="📷 Owner's photo shown on the STORY page and ABOUT section on home page. Best: portrait/headshot, professional or training photo, clear face, good lighting."
        value={form.image||''} onChange={v=>set('image',v)} />
      <div className="op-row">
        <OpField label="Owner Full Name"><input value={form.name||''} onChange={e=>set('name',e.target.value)} /></OpField>
        <OpField label="Title / Role"><input value={form.title||''} onChange={e=>set('title',e.target.value)} placeholder="Head Coach & Founder" /></OpField>
      </div>
      <OpField label="Bio (paragraph shown on Story page)">
        <textarea rows={5} value={form.bio||''} onChange={e=>set('bio',e.target.value)} />
      </OpField>
      <h4 className="op-sub-heading">Competition Achievements</h4>
      {(form.achievements||[]).map((a,i)=>(
        <div key={i} className="op-row" style={{alignItems:'flex-end'}}>
          <OpField label={`Achievement ${i+1}`}><input value={a.title} onChange={e=>updAch(i,'title',e.target.value)} placeholder="Punjab State Championship" /></OpField>
          <OpField label="Year" style={{maxWidth:'120px'}}><input value={a.year} onChange={e=>updAch(i,'year',e.target.value)} /></OpField>
          <button className="icon-btn red" onClick={()=>delAch(i)}>✕</button>
        </div>
      ))}
      <button className="btn-outline" style={{marginTop:'8px'}} onClick={addAch}>+ Add Achievement</button>
      <SaveBtn onClick={save} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  GYM STORY TAB
// ─────────────────────────────────────────────────────────────────────────────
function TabStory() {
  const { content, updateSection } = useContent()
  const [form, setForm] = useState({ ...content.story, timeline: [...(content.story.timeline||[])] })
  const [toast, setToast] = useState('')
  const save = async () => { const ok = await updateSection('story', form); setToast(ok?'Saved ✓':'Error'); setTimeout(()=>setToast(''),2500) }
  const updTl = (i,k,v) => setForm(p=>({...p, timeline: p.timeline.map((t,j)=>j===i?{...t,[k]:v}:t)}))
  const addTl = () => setForm(p=>({...p, timeline:[...p.timeline,{year:'',heading:'',text:'',image:''}]}))
  const delTl = (i) => setForm(p=>({...p, timeline: p.timeline.filter((_,j)=>j!==i)}))

  return (
    <div>
      {toast && <div className="op-toast">{toast}</div>}
      <OpField label="Story Page Heading">
        <input value={form.heading||''} onChange={e=>setForm(p=>({...p,heading:e.target.value}))} />
      </OpField>
      <OpField label="Intro Paragraph">
        <textarea rows={3} value={form.intro||''} onChange={e=>setForm(p=>({...p,intro:e.target.value}))} />
      </OpField>
      <h4 className="op-sub-heading">Timeline Events (each year's story)</h4>
      {(form.timeline||[]).map((t,i)=>(
        <div key={i} className="tl-edit-block">
          <div className="tl-edit-header">
            <span className="tl-edit-num">Event {i+1}</span>
            <button className="icon-btn red" onClick={()=>delTl(i)}>✕ Remove</button>
          </div>
          <div className="op-row">
            <OpField label="Year (e.g. 2019 or 'Today')"><input value={t.year} onChange={e=>updTl(i,'year',e.target.value)} /></OpField>
            <OpField label="Heading"><input value={t.heading} onChange={e=>updTl(i,'heading',e.target.value)} /></OpField>
          </div>
          <OpField label="Story Text"><textarea rows={4} value={t.text} onChange={e=>updTl(i,'text',e.target.value)} /></OpField>
          <ImageField
            label={`PHOTO FOR "${t.year||`Event ${i+1}`}" TIMELINE`}
            description={`📸 Shown next to the ${t.year||`event ${i+1}`} story text on the Story page. Landscape photo recommended.`}
            value={t.image||''} onChange={v=>updTl(i,'image',v)} compact />
        </div>
      ))}
      <button className="btn-outline" onClick={addTl}>+ Add Timeline Event</button>
      <SaveBtn onClick={save} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  RESULTS TAB
// ─────────────────────────────────────────────────────────────────────────────
function TabResults() {
  const { content, updateSection } = useContent()
  const [results, setResults] = useState([...content.results])
  const [toast, setToast] = useState('')
  const save = async () => { const ok = await updateSection('results', results); setToast(ok?'Saved ✓':'Error'); setTimeout(()=>setToast(''),2500) }
  const upd = (id,k,v) => setResults(p=>p.map(r=>r.id===id?{...r,[k]:v}:r))
  const add = () => setResults(p=>[...p,{id:Date.now(),name:'',before:'',after:'',result:'',duration:'',type:'weight-loss'}])
  const del = (id) => setResults(p=>p.filter(r=>r.id!==id))

  return (
    <div>
      {toast && <div className="op-toast">{toast}</div>}
      <p className="op-hint">Before/After transformation cards on the Results page. Drag slider reveals before/after photo.</p>
      {results.map((r,i)=>(
        <div key={r.id} className="tl-edit-block">
          <div className="tl-edit-header">
            <span className="tl-edit-num">Transformation {i+1}</span>
            <button className="icon-btn red" onClick={()=>del(r.id)}>✕ Remove</button>
          </div>
          <div className="op-row">
            <OpField label="Member Name"><input value={r.name} onChange={e=>upd(r.id,'name',e.target.value)} placeholder="Arjun Sharma" /></OpField>
            <OpField label="Type">
              <select value={r.type} onChange={e=>upd(r.id,'type',e.target.value)}>
                <option value="weight-loss">Weight Loss</option>
                <option value="muscle-gain">Muscle Gain</option>
                <option value="transformation">Transformation</option>
              </select>
            </OpField>
          </div>
          <div className="op-row">
            <OpField label="Result shown (e.g. -18 kg)"><input value={r.result} onChange={e=>upd(r.id,'result',e.target.value)} /></OpField>
            <OpField label="Duration (e.g. 3 Months)"><input value={r.duration} onChange={e=>upd(r.id,'duration',e.target.value)} /></OpField>
          </div>
          <ImageField label={`BEFORE PHOTO — ${r.name||`Member ${i+1}`}`}
            description="📷 Member's BEFORE photo. Shown on LEFT side of the drag slider. Portrait or square orientation. Get member's consent before uploading."
            value={r.before} onChange={v=>upd(r.id,'before',v)} compact />
          <ImageField label={`AFTER PHOTO — ${r.name||`Member ${i+1}`}`}
            description="📷 Member's AFTER photo. Shown on RIGHT side of the drag slider. Same angle as before photo gives best effect."
            value={r.after} onChange={v=>upd(r.id,'after',v)} compact />
        </div>
      ))}
      <button className="btn-outline" onClick={add}>+ Add Transformation</button>
      <SaveBtn onClick={save} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  GALLERY TAB
// ─────────────────────────────────────────────────────────────────────────────
function TabGallery() {
  const { content, updateSection } = useContent()
  const [gallery, setGallery] = useState([...content.gallery])
  const [toast, setToast] = useState('')
  const save = async () => { const ok = await updateSection('gallery', gallery); setToast(ok?'Saved ✓':'Error'); setTimeout(()=>setToast(''),2500) }
  const upd = (id,k,v) => setGallery(p=>p.map(g=>g.id===id?{...g,[k]:v}:g))
  const add = () => setGallery(p=>[...p,{id:Date.now(),url:'',caption:'',category:'gym'}])
  const del = (id) => setGallery(p=>p.filter(g=>g.id!==id))
  const CATS = ['gym','equipment','competitions','trophies','moments']

  return (
    <div>
      {toast && <div className="op-toast">{toast}</div>}
      <p className="op-hint">Photos shown in the Gallery page. Visitors can filter by category.</p>
      <div className="gallery-edit-grid">
        {gallery.map((g,i)=>(
          <div key={g.id} className="gallery-edit-item">
            <div className="gallery-edit-preview">
              {g.url ? <img src={g.url} alt="" onError={e=>e.target.style.display='none'} /> : <div className="gallery-no-img">No Image Yet</div>}
              <button className="gallery-del-btn" onClick={()=>del(g.id)}>✕</button>
            </div>
            <ImageField
              label={`GALLERY PHOTO ${i+1} — "${g.caption||'No caption yet'}"`}
              description={`📸 Shown in Gallery under the "${g.category}" category tab. Any gym photo: equipment, training moments, competition, achievements.`}
              value={g.url} onChange={v=>upd(g.id,'url',v)} compact />
            <OpField label="Caption (text shown on hover)">
              <input value={g.caption} onChange={e=>upd(g.id,'caption',e.target.value)} placeholder="Main Training Floor" />
            </OpField>
            <OpField label="Category (which tab it appears in)">
              <select value={g.category} onChange={e=>upd(g.id,'category',e.target.value)}>
                {CATS.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </OpField>
          </div>
        ))}
      </div>
      <button className="btn-outline" onClick={add}>+ Add Photo</button>
      <SaveBtn onClick={save} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  TROPHIES TAB
// ─────────────────────────────────────────────────────────────────────────────
function TabTrophies() {
  const { content, updateSection } = useContent()
  const [trophies, setTrophies] = useState([...content.trophies])
  const [toast, setToast] = useState('')
  const save = async () => { const ok = await updateSection('trophies', trophies); setToast(ok?'Saved ✓':'Error'); setTimeout(()=>setToast(''),2500) }
  const upd = (id,k,v) => setTrophies(p=>p.map(t=>t.id===id?{...t,[k]:v}:t))
  const add = () => setTrophies(p=>[...p,{id:Date.now(),image:'',title:'',year:'',level:'Gold'}])
  const del = (id) => setTrophies(p=>p.filter(t=>t.id!==id))

  return (
    <div>
      {toast && <div className="op-toast">{toast}</div>}
      <p className="op-hint">Trophies and medals shown on the Story page in a horizontal scrollable strip.</p>
      {trophies.map((t,i)=>(
        <div key={t.id} className="tl-edit-block">
          <div className="tl-edit-header">
            <span className="tl-edit-num">Award {i+1}</span>
            <button className="icon-btn red" onClick={()=>del(t.id)}>✕ Remove</button>
          </div>
          <ImageField label={`TROPHY / MEDAL PHOTO — "${t.title||`Award ${i+1}`}"`}
            description="🏆 Close-up photo of the physical trophy, medal, or certificate. Square or portrait orientation. A gold/warm light makes trophies look best."
            value={t.image} onChange={v=>upd(t.id,'image',v)} compact />
          <div className="op-row">
            <OpField label="Award Name"><input value={t.title} onChange={e=>upd(t.id,'title',e.target.value)} placeholder="Punjab State Championship" /></OpField>
            <OpField label="Year"><input value={t.year} onChange={e=>upd(t.id,'year',e.target.value)} /></OpField>
            <OpField label="Level">
              <select value={t.level} onChange={e=>upd(t.id,'level',e.target.value)}>
                <option>Gold</option><option>Silver</option><option>Bronze</option><option>Award</option>
              </select>
            </OpField>
          </div>
        </div>
      ))}
      <button className="btn-outline" onClick={add}>+ Add Trophy / Award</button>
      <SaveBtn onClick={save} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MEMBERSHIP PLANS TAB
// ─────────────────────────────────────────────────────────────────────────────
function TabMembership() {
  const { content, updateSection } = useContent()
  const [plans, setPlans] = useState([...content.membership])
  const [toast, setToast] = useState('')
  const save = async () => { const ok = await updateSection('membership', plans); setToast(ok?'Saved ✓':'Error'); setTimeout(()=>setToast(''),2500) }
  const upd = (id,k,v) => setPlans(p=>p.map(pl=>pl.id===id?{...pl,[k]:v}:pl))
  const updF = (id,i,v) => setPlans(p=>p.map(pl=>pl.id===id?{...pl,features:pl.features.map((f,j)=>j===i?v:f)}:pl))
  const addF = (id) => setPlans(p=>p.map(pl=>pl.id===id?{...pl,features:[...(pl.features||[]),'New feature']}:pl))
  const delF = (id,i) => setPlans(p=>p.map(pl=>pl.id===id?{...pl,features:(pl.features||[]).filter((_,j)=>j!==i)}:pl))
  const addPlan = () => setPlans(p=>[...p,{id:Date.now(),name:'New Plan',price:'',period:'month',badge:'',features:['Feature 1','Feature 2']}])
  const delPlan = (id) => { if (!confirm('Remove this plan?')) return; setPlans(p=>p.filter(pl=>pl.id!==id)) }

  return (
    <div>
      {toast && <div className="op-toast">{toast}</div>}
      <p className="op-hint">Membership plans shown on the home page. Also used in the Members tab for plan selection.</p>
      {plans.map((plan,i)=>(
        <div key={plan.id} className="tl-edit-block">
          <div className="tl-edit-header">
            <span className="tl-edit-num">Plan {i+1}</span>
            <button className="icon-btn red" onClick={()=>delPlan(plan.id)}>✕ Remove Plan</button>
          </div>
          <div className="op-row">
            <OpField label="Plan Name"><input value={plan.name} onChange={e=>upd(plan.id,'name',e.target.value)} /></OpField>
            <OpField label="Price (₹)"><input value={plan.price} onChange={e=>upd(plan.id,'price',e.target.value)} /></OpField>
            <OpField label="Period"><input value={plan.period} onChange={e=>upd(plan.id,'period',e.target.value)} placeholder="month" /></OpField>
          </div>
          <OpField label="Badge label (e.g. 'Most Popular' — leave blank for none)">
            <input value={plan.badge||''} onChange={e=>upd(plan.id,'badge',e.target.value)} />
          </OpField>
          <h4 className="op-sub-heading">Features included in this plan</h4>
          {(plan.features||[]).map((f,fi)=>(
            <div key={fi} className="op-row" style={{alignItems:'flex-end'}}>
              <OpField label={`Feature ${fi+1}`}><input value={f} onChange={e=>updF(plan.id,fi,e.target.value)} /></OpField>
              <button className="icon-btn red" onClick={()=>delF(plan.id,fi)}>✕</button>
            </div>
          ))}
          <button className="btn-outline" style={{marginBottom:'8px'}} onClick={()=>addF(plan.id)}>+ Add Feature</button>
        </div>
      ))}
      <button className="btn-outline" onClick={addPlan}>+ Add New Plan</button>
      <SaveBtn onClick={save} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECURITY TAB — change password via Supabase Auth
// ─────────────────────────────────────────────────────────────────────────────
function TabSecurity() {
  const [form, setForm] = useState({ newPwd:'', confirm:'' })
  const [msg,  setMsg]  = useState({ text:'', ok:true })
  const [busy, setBusy] = useState(false)

  const change = async () => {
    if (!form.newPwd)               { setMsg({text:'Enter a new password.',ok:false}); return }
    if (form.newPwd !== form.confirm){ setMsg({text:'Passwords do not match.',ok:false}); return }
    if (form.newPwd.length < 8)     { setMsg({text:'Password must be at least 8 characters.',ok:false}); return }
    setBusy(true)
    const { error } = await changeOwnerPassword(form.newPwd)
    setBusy(false)
    if (error) { setMsg({text:'Error: ' + error.message, ok:false}) }
    else { setMsg({text:'✓ Password changed successfully!',ok:true}); setForm({newPwd:'',confirm:''}) }
  }

  return (
    <div>
      <h3 className="op-section-title">Change Password</h3>
      <p className="op-hint">
        Your panel URL: <code style={{background:'var(--surface-2)',padding:'2px 8px',borderRadius:'3px'}}>/kgadmin-9x2</code><br/>
        To change the secret URL, open <code>src/App.jsx</code> and edit the path.<br/>
        Password is managed by Supabase Auth — secure, not stored in browser.
      </p>

      <div style={{maxWidth:'440px', marginTop:'32px', display:'flex', flexDirection:'column', gap:'16px'}}>
        <OpField label="New Password (min 8 characters)">
          <input type="password" value={form.newPwd} onChange={e=>setForm(p=>({...p,newPwd:e.target.value}))} />
        </OpField>
        <OpField label="Confirm New Password">
          <input type="password" value={form.confirm} onChange={e=>setForm(p=>({...p,confirm:e.target.value}))} />
        </OpField>
        {msg.text && <p style={{fontSize:'13px', color: msg.ok ? '#22c55e' : 'var(--red)'}}>{msg.text}</p>}
        <button className="btn-red" onClick={change} disabled={busy}>{busy ? 'Saving…' : 'Change Password'}</button>
      </div>

      <div style={{marginTop:'48px', paddingTop:'32px', borderTop:'1px solid var(--border)'}}>
        <h3 className="op-section-title" style={{fontSize:'20px'}}>Reset Site Content to Defaults</h3>
        <p className="op-hint">This resets ALL website content (gym info, gallery, etc.) back to the placeholder defaults. Member records and enquiries are NOT affected.</p>
        <button className="btn-outline" style={{borderColor:'var(--red)',color:'var(--red)'}}
          onClick={async () => {
            if (!confirm('Reset ALL site content to default placeholder data? This cannot be undone.')) return
            const { resetToDefaults } = await import('../context/ContentProvider').then(m => ({ resetToDefaults: null }))
            // Reload page after reset
            const { setContent } = await import('../lib/db')
            const { default: def } = await import('../data/defaultContent')
            await setContent(def)
            alert('Reset done. Reloading…')
            window.location.reload()
          }}>
          ⚠ Reset All Content to Defaults
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function OpField({ label, hint, children }) {
  return (
    <div className="op-field">
      <label className="op-label">{label}</label>
      {hint && <p className="op-field-hint">{hint}</p>}
      {children}
    </div>
  )
}

function SaveBtn({ onClick }) {
  return (
    <div style={{marginTop:'40px', paddingTop:'24px', borderTop:'1px solid var(--border)'}}>
      <button className="btn-red" onClick={onClick} style={{minWidth:'160px'}}>Save Changes ✓</button>
    </div>
  )
}

function ImageField({ label, description, instructions, value, onChange, isVideo=false, compact=false }) {
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  const upload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      alert('File too large (max 3MB).\nPlease compress the image first, or paste a URL instead.\n\nFree compression: squoosh.app')
      return
    }
    setBusy(true)
    const reader = new FileReader()
    reader.onload = ev => { onChange(ev.target.result); setBusy(false) }
    reader.readAsDataURL(file)
  }

  return (
    <div className={`img-field ${compact ? 'compact' : ''}`}>
      <div className="img-field-header"><span className="img-field-label">{label}</span></div>
      <p className="img-field-desc">{description}</p>
      {instructions && (
        <div className="img-field-instructions">
          {instructions.map((line,i) => <p key={i}>{line}</p>)}
        </div>
      )}
      {value && (
        <div className="img-preview-wrap">
          {isVideo
            ? <video src={value} className="img-preview-media" controls muted />
            : <img src={value} alt="preview" className="img-preview-media" onError={e=>e.target.style.opacity='0.3'} />}
          <button className="img-clear-btn" onClick={()=>onChange('')}>✕ Remove</button>
        </div>
      )}
      <div className="img-field-inputs">
        <OpField label={isVideo ? 'Video URL (MP4 link or /videos/filename.mp4)' : 'Image URL (paste any public image link)'}>
          <input type="url"
            placeholder={isVideo ? 'https://... or /videos/hero.mp4' : 'https://...'}
            value={value?.startsWith('data:') ? '' : (value||'')}
            onChange={e => onChange(e.target.value)} />
        </OpField>
        {!isVideo && (
          <div className="img-upload-option">
            <span className="img-or">OR</span>
            <div>
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={upload} />
              <button className="btn-outline" onClick={()=>fileRef.current?.click()} disabled={busy}>
                {busy ? 'Uploading…' : '📱 Upload from Phone / Tablet'}
              </button>
              <p className="op-field-hint" style={{marginTop:'6px'}}>Max 3MB. Compress first at squoosh.app if needed.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
