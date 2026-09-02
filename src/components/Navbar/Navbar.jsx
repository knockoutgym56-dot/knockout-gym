import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import HoverLinks from '../HoverLinks/HoverLinks'
import { useContent } from '../../context/ContentProvider'
import './Navbar.css'

gsap.registerPlugin(ScrollTrigger)

// Lenis instance shared globally
let lenisInstance = null

export function getLenis() { return lenisInstance }

const NAV_LINKS = [
  { label: 'Story',      to: '/story'   },
  { label: 'Results',   to: '/results' },
  { label: 'Gallery',   to: '/gallery' },
  { label: 'Contact',   to: '/contact' },
]

export default function Navbar() {
  const navRef    = useRef(null)
  const barRef    = useRef(null)
  const [open, setOpen] = useState(false)
  const { content } = useContent()
  const location = useLocation()

  // Close mobile menu on route change
  useEffect(() => { setOpen(false) }, [location])

  // Lenis smooth scroll (desktop only)
  useEffect(() => {
    const isDesktop =
      window.matchMedia('(pointer: fine)').matches &&
      window.innerWidth > 1024

    if (!isDesktop) {
      // Mobile: scroll progress bar
      const bar = document.getElementById('scroll-bar')
      const onScroll = () => {
        if (!bar) return
        const max = document.body.scrollHeight - window.innerHeight
        bar.style.width = (window.scrollY / max * 100) + '%'
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }

    lenisInstance = new Lenis({
      duration: 1.7,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    lenisInstance.on('scroll', ScrollTrigger.update)

    gsap.ticker.add(time => lenisInstance.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenisInstance?.destroy()
      lenisInstance = null
    }
  }, [])

  // Navbar background on scroll
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add('nav-scrolled')
      else nav.classList.remove('nav-scrolled')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const gymName = content?.gym?.name || 'Knockout Gym'

  return (
    <>
      {/* Scroll progress bar for mobile */}
      <div id="scroll-bar" />

      <nav ref={navRef} className="navbar">
        <div className="nav-inner container">
          <Link to="/" className="nav-logo">
            <span className="nav-logo-ko">KO</span>
            <span className="nav-logo-dot">·</span>
            <span className="nav-logo-name">{gymName}</span>
          </Link>

          {/* Desktop links */}
          <ul className="nav-links">
            {NAV_LINKS.map(link => (
              <li key={link.to}>
                <Link to={link.to} className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}>
                  <HoverLinks>{link.label}</HoverLinks>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/contact" className="btn-red nav-cta">Join Now</Link>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button
            className={`nav-burger ${open ? 'is-open' : ''}`}
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile overlay menu */}
      <div className={`mobile-menu ${open ? 'is-open' : ''}`}>
        <ul className="mobile-links">
          {NAV_LINKS.map(link => (
            <li key={link.to}>
              <Link to={link.to} className="mobile-link">{link.label}</Link>
            </li>
          ))}
          <li>
            <Link to="/contact" className="btn-red mobile-cta">Join Now</Link>
          </li>
        </ul>
        <div className="mobile-menu-footer">
          <span className="section-label">{content?.gym?.phone || '085828 59970'}</span>
        </div>
      </div>
    </>
  )
}
