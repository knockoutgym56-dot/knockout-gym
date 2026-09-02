import { Link } from 'react-router-dom'
import { useContent } from '../../context/ContentProvider'
import './Footer.css'

export default function Footer() {
  const { content } = useContent()
  const g = content?.gym || {}

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-ko">KO</span>
              <span className="footer-name">{g.name || 'Knockout Gym'}</span>
            </div>
            <p className="footer-tagline">{g.tagline || 'Where Champions Are Forged.'}</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <p className="footer-col-head">Navigate</p>
              <Link to="/">Home</Link>
              <Link to="/story">Story</Link>
              <Link to="/results">Results</Link>
              <Link to="/gallery">Gallery</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div className="footer-col">
              <p className="footer-col-head">Hours</p>
              <span>Mon – Sat</span>
              <span>{g.hours?.weekdays || '5:30 AM – 10:00 PM'}</span>
              <span>Sunday: {g.hours?.sunday || 'Closed'}</span>
            </div>
            <div className="footer-col">
              <p className="footer-col-head">Reach Us</p>
              <a href={`tel:${g.phone}`}>{g.phone || '085828 59970'}</a>
              {g.email && <a href={`mailto:${g.email}`}>{g.email}</a>}
              {g.whatsapp && (
                <a href={`https://wa.me/${g.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              )}
              {g.instagram && (
                <a href={`https://instagram.com/${g.instagram}`} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="footer-bottom">
          <span className="section-label">
            © {new Date().getFullYear()} {g.name || 'Knockout Gym'} — Zirakpur, Punjab
          </span>
          <span className="section-label">
            Built by Rajat Kumar Dua
          </span>
        </div>
      </div>
    </footer>
  )
}
