import { useEffect, useRef } from 'react'
import './Cursor.css'

export default function Cursor() {
  const dotRef   = useRef(null)
  const ringRef  = useRef(null)
  const pos      = useRef({ x: 0, y: 0 })
  const ring     = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Only on desktop (fine pointer + wide screen)
    const isDesktop =
      window.matchMedia('(pointer: fine)').matches &&
      window.innerWidth > 1024
    if (!isDesktop) return

    const dot  = dotRef.current
    const rngl = ringRef.current
    if (!dot || !rngl) return

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      dot.style.left = e.clientX + 'px'
      dot.style.top  = e.clientY + 'px'
    }

    let raf
    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12
      ring.current.y += (pos.current.y - ring.current.y) * 0.12
      rngl.style.left = ring.current.x + 'px'
      rngl.style.top  = ring.current.y + 'px'
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    // Grow cursor on links/buttons
    const onEnter = () => rngl.classList.add('cursor-grow')
    const onLeave = () => rngl.classList.remove('cursor-grow')
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    window.addEventListener('mousemove', onMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  />
      <div ref={ringRef} className="cursor-ring" />
    </>
  )
}
