import { useState, useRef, useCallback } from 'react'
import { useContent } from '../context/ContentProvider'
import './Results.css'

const FILTERS = [
  { key: 'all',            label: 'All'            },
  { key: 'weight-loss',    label: 'Weight Loss'    },
  { key: 'muscle-gain',    label: 'Muscle Gain'    },
  { key: 'transformation', label: 'Transformation' },
]

export default function Results() {
  const { content } = useContent()
  const [filter, setFilter] = useState('all')

  // Only show results that have BOTH images
  const results = (content?.results || []).filter(r => r.before && r.after)
  const filtered = filter === 'all' ? results : results.filter(r => r.type === filter)

  // Only show filter tabs for types that actually have results
  const activeTypes = new Set(results.map(r => r.type).filter(Boolean))
  const visibleFilters = FILTERS.filter(f => f.key === 'all' || activeTypes.has(f.key))

  return (
    <div className="page results-page">
      <div className="container">
        <p className="section-label red">Transformations</p>
        <h1 className="res-heading">Real Results.<br />Real People.</h1>
        <p className="res-sub">{results.length} transformation{results.length !== 1 ? 's' : ''} and counting.</p>

        {visibleFilters.length > 1 && (
          <div className="filter-bar">
            {visibleFilters.map(f => (
              <button key={f.key} className={`filter-btn ${filter===f.key?'active':''}`} onClick={()=>setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="no-results">No transformations in this category yet.</p>
        ) : (
          <div className="ba-grid">
            {filtered.map(r => <BACard key={r.id} data={r} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function BACard({ data }) {
  const [pct,  setPct]  = useState(50)
  const [drag, setDrag] = useState(false)
  const cardRef = useRef(null)

  const calcPct = useCallback((clientX) => {
    const rect = cardRef.current.getBoundingClientRect()
    setPct(Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  return (
    <div className="ba-card">
      <div ref={cardRef} className="ba-slider"
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); setDrag(true) }}
        onPointerMove={e => { if (drag) calcPct(e.clientX) }}
        onPointerUp={() => setDrag(false)}
        onPointerLeave={() => setDrag(false)}
      >
        <img src={data.after}  alt="After"  className="ba-after"  onError={e => e.target.style.opacity='0.2'} />
        <div className="ba-before-wrap" style={{ clipPath: `inset(0 ${100-pct}% 0 0)` }}>
          <img src={data.before} alt="Before" className="ba-before" onError={e => e.target.style.opacity='0.2'} />
          <span className="ba-label ba-label-left">BEFORE</span>
        </div>
        <span className="ba-label ba-label-right">AFTER</span>
        <div className="ba-handle" style={{ left: `${pct}%` }}>
          <div className="ba-handle-line" />
          <div className="ba-handle-circle">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 8l-4 0M5 8l-3-3M5 8l-3 3M11 8l4 0M11 8l3-3M11 8l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
      {/* Info only shows fields that exist */}
      <div className="ba-info">
        {data.name     && <span className="ba-name">{data.name}</span>}
        {data.result   && <span className="ba-result">{data.result}</span>}
        {data.duration && <span className="ba-duration">{data.duration}</span>}
      </div>
    </div>
  )
}
