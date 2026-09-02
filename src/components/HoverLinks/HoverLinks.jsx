import './HoverLinks.css'

// Same hover technique as Rajat's portfolio — text slides up to reveal duplicate
export default function HoverLinks({ children, className = '' }) {
  return (
    <span className={`hl-wrap ${className}`}>
      <span className="hl-inner">{children}</span>
      <span className="hl-inner hl-clone" aria-hidden="true">{children}</span>
    </span>
  )
}
