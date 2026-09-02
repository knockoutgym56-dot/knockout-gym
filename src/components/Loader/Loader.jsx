import { useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { useLoading } from '../../context/LoadingProvider'
import { useContent }  from '../../context/ContentProvider'
import './Loader.css'

export default function Loader() {
  const { isLoaded, finishLoading } = useLoading()
  const { contentReady }            = useContent()

  const loaderRef       = useRef(null)
  const barRef          = useRef(null)
  const pctRef          = useRef(null)
  const animDoneRef     = useRef(false)   // bar animation finished?
  const slidingRef      = useRef(false)   // slide-away already triggered?

  // ── Always keep a fresh ref to contentReady ──────────────────────────────
  // GSAP callbacks are closures; they'd see a stale value if we read the
  // prop directly. Assigning to a ref in the render body gives us the latest
  // value from any callback without adding it to effect dependencies.
  const contentReadyRef = useRef(contentReady)
  contentReadyRef.current = contentReady

  // ── Slide the loader off-screen then signal the app it can run ───────────
  const slideAway = useCallback(() => {
    if (slidingRef.current) return   // guard against double-calls
    slidingRef.current = true
    gsap.to(loaderRef.current, {
      yPercent: -100,
      duration: 0.8,
      ease: 'power4.inOut',
      onComplete: finishLoading,
    })
  }, [finishLoading])

  // ── Bar animation — runs once on mount ───────────────────────────────────
  useEffect(() => {
    if (isLoaded) return

    // Reset guards on (re-)mount so StrictMode's second invocation works cleanly
    animDoneRef.current = false
    slidingRef.current  = false

    const tl = gsap.timeline({
      onComplete: () => {
        animDoneRef.current = true
        // If Supabase already responded, slide away immediately.
        // Otherwise wait — the effect below watches contentReady.
        if (contentReadyRef.current) slideAway()
      },
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

    // ── KEY FIX: kill the timeline on unmount ─────────────────────────────
    // React 18 StrictMode mounts → unmounts → remounts every component in dev.
    // Without this cleanup the first timeline's onComplete fires on stale refs
    // and calls slideAway() / finishLoading() way too early — making the KO
    // screen vanish in under a second and leaving a black page.
    return () => { tl.kill() }

  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── If content became ready AFTER the bar finished, slide away now ───────
  useEffect(() => {
    if (contentReady && animDoneRef.current && !isLoaded) {
      slideAway()
    }
  }, [contentReady, isLoaded, slideAway])

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
