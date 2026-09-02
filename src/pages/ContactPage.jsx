import { useState } from 'react'
import { useContent } from '../context/ContentProvider'
import { addEnquiry } from '../lib/db'
import './ContactPage.css'

export default function ContactPage() {
  const { content } = useContent()
  const g = content?.gym || {}
  const [form, setForm]     = useState({ name: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle')

  const isOpen = () => {
    const now = new Date()
    const day = now.getDay()
    if (day === 0) return false
    const mins = now.getHours() * 60 + now.getMinutes()
    return mins >= 5 * 60 + 30 && mins < 22 * 60
  }

  const handleSend = async () => {
    if (!form.name.trim() || !form.phone.trim()) { setStatus('error'); return }
    setStatus('sending')
    await addEnquiry({ name: form.name, phone: form.phone, message: form.message })
    setStatus('sent')
    setForm({ name: '', phone: '', message: '' })
  }

  return (
    <div className="page contact-page">
      <div className="container">
        <p className="section-label red">Get In Touch</p>
        <h1 className="con-heading">Find Us.</h1>

        <div className="con-grid">
          <div className="con-info">
            <div className="con-status">
              <span className={`status-dot ${isOpen() ? 'open' : 'closed'}`} />
              <span className="status-text">{isOpen() ? 'Open Now' : 'Closed'}</span>
            </div>
            <div className="con-block">
              <p className="con-block-head">Address</p>
              <p className="con-block-val">{g.address}</p>
            </div>
            <div className="con-block">
              <p className="con-block-head">Phone</p>
              <a href={`tel:${g.phone}`} className="con-block-val con-link">{g.phone}</a>
            </div>
            {g.email && (
              <div className="con-block">
                <p className="con-block-head">Email</p>
                <a href={`mailto:${g.email}`} className="con-block-val con-link">{g.email}</a>
              </div>
            )}
            <div className="con-block">
              <p className="con-block-head">Hours</p>
              <div className="hours-row">
                <span className="hours-label">Mon – Sat</span>
                <span className="hours-val">{g.hours?.weekdays}</span>
              </div>
              <div className="hours-row">
                <span className="hours-label">Sunday</span>
                <span className="hours-val closed-text">{g.hours?.sunday}</span>
              </div>
            </div>
            {g.whatsapp && (
              <a href={`https://wa.me/${g.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-red con-wa">
                WhatsApp Us →
              </a>
            )}
          </div>

          <div className="con-form">
            <p className="section-label">Send a Message</p>
            <div className="form-field">
              <label>Full Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Arjun Sharma" />
            </div>
            <div className="form-field">
              <label>Phone Number *</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="9876543210" type="tel" />
            </div>
            <div className="form-field">
              <label>Message</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="I'm interested in joining…" rows={5} />
            </div>
            {status === 'error'   && <p className="form-error">Please fill in your name and phone number.</p>}
            {status === 'sending' && <p className="form-success">Sending…</p>}
            {status === 'sent'    && <p className="form-success">✓ Message sent! We'll call you soon.</p>}
            <button className="btn-red form-btn" onClick={handleSend} disabled={status === 'sending'}>
              Send Message →
            </button>
          </div>
        </div>

        {g.mapEmbed && (
          <div className="con-map">
            <iframe src={g.mapEmbed} title="Knockout Gym Location" loading="lazy" />
          </div>
        )}
      </div>
    </div>
  )
}
