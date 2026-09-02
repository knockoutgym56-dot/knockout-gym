import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useLoading } from '../../context/LoadingProvider'
import './Loader.css'

export default function Loader() {
  const { isLoaded, finishLoading, contentReady } = useLoading()
  const loaderRef   = useRef(null)
  const barRef      = useRef(null)
  const pctRef      = useRef(null)
  const tlRef       = useRef(null)
  const readyRef    = useRef(false)  // tracks if contentReady fired before anim ended
  const animDoneRef = useRef(false)  // tracks if anim finished before contentReady

  const slideOut = () => {
    gsap.to(loaderRef.current, {
      yPercent: -100,
      duration: 0.8,
      ease: 'power4.inOut',
      onComplete: finishLoading,
    })
  }

  useEffect(() => {
    if (isLoaded) return

    // Animate bar from 0 → 85% quickly, then hold until contentReady
    tlRef.current = gsap.timeline()

    tlRef.current.to(barRef.current, {
      scaleX: 0.85,
      duration: 1.2,
      ease: 'power2.out',
    })
    tlRef.current.to(pctRef.current, {
      textContent: '85',
      duration: 1.2,
      snap: { textContent: 1 },
      ease: 'power2.out',
    }, '<')

    tlRef.current.eventCallback('onComplete', () => {
      animDoneRef.current = true
      // If content was already ready before animation reached 85%, finish now
      if (readyRef.current) {
        finishBar()
      }
    })
  }, [])

  // When Supabase fetch completes, fill bar to 100% and slide out
  useEffect(() => {
    if (!contentReady) return
    readyRef.current = true

    if (animDoneRef.current) {
      // Animation already at 85%, content just arrived — finish immediately
      finishBar()
    }
    // else: animComplete callback will call finishBar() when it catches up
  }, [contentReady])

  function finishBar() {
    gsap.timeline()
      .to(barRef.current, { scaleX: 1, duration: 0.4, ease: 'power2.out' })
      .to(pctRef.current, { textContent: '100', duration: 0.4, snap: { textContent: 1 }, ease: 'power2.out' }, '<')
      .call(slideOut)
  }

  if (isLoaded) return null

  return (
    <div ref={loaderRef} className="loader">
      <div className="loader-logo">
        <span className="loader-ko">KO</span>
        <span className="loader-name">KNOCKOUT GYM</span>
      </div>
      <div className="loader-bottom">
        <div className="loader-bar-track">
          <div ref={barRef} className="loader-bar" />
        </div>
        <span ref={pctRef} className="loader-pct">0</span>
      </div>
    </div>
  )
}

