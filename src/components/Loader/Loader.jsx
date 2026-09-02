import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useLoading } from '../../context/LoadingProvider'
import './Loader.css'

export default function Loader() {
  const { isLoaded, finishLoading } = useLoading()
  const loaderRef = useRef(null)
  const barRef    = useRef(null)
  const pctRef    = useRef(null)

  useEffect(() => {
    if (isLoaded) return

    const tl = gsap.timeline({
      onComplete: () => {
        // Slide loader up off screen
        gsap.to(loaderRef.current, {
          yPercent: -100,
          duration: 0.8,
          ease: 'power4.inOut',
          onComplete: finishLoading,
        })
      }
    })

    tl.to(barRef.current, {
      scaleX: 1,
      duration: 1.6,
      ease: 'power2.inOut',
    })
    tl.to(pctRef.current, {
      textContent: '100',
      duration: 1.6,
      snap: { textContent: 1 },
      ease: 'power2.inOut',
    }, '<')
  }, [])

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
