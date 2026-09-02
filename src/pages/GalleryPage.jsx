import { useState } from 'react'
import { useContent } from '../context/ContentProvider'
import './GalleryPage.css'

const CATS = [
  { key: 'all',          label: 'All'          },
  { key: 'gym',          label: 'Gym Space'     },
  { key: 'equipment',    label: 'Equipment'     },
  { key: 'competitions', label: 'Competitions'  },
  { key: 'trophies',     label: 'Trophies'      },
  { key: 'moments',      label: 'Moments'       },
]

export default function GalleryPage() {
  const { content } = useContent()
  const [cat,      setCat]      = useState('all')
  const [lightbox, setLightbox] = useState(null)
  const [broken,   setBroken]   = useState(new Set()) // track broken images

  // Only show photos that have a URL AND aren't broken
  const gallery  = (content?.gallery || []).filter(g => g.url && !broken.has(g.id))
  const filtered = cat === 'all' ? gallery : gallery.filter(g => g.category === cat)

  // Get which categories actually have photos (only show those filter tabs)
  const activeCats = ['all', ...new Set(gallery.map(g => g.category).filter(Boolean))]
  const visibleCats = CATS.filter(c => activeCats.includes(c.key))

  const handleError = (id) => setBroken(prev => new Set([...prev, id]))

  const prev = () => {
    const idx = filtered.findIndex(g => g.id === lightbox.id)
    setLightbox(filtered[(idx - 1 + filtered.length) % filtered.length])
  }
  const next = () => {
    const idx = filtered.findIndex(g => g.id === lightbox.id)
    setLightbox(filtered[(idx + 1) % filtered.length])
  }

  return (
    <div className="page gallery-page">
      <div className="container">
        <p className="section-label red">Photo Gallery</p>
        <h1 className="gal-heading">Inside Knockout.</h1>

        {/* Only show filter tabs for categories that have actual photos */}
        {visibleCats.length > 1 && (
          <div className="filter-bar">
            {visibleCats.map(c => (
              <button key={c.key} className={`filter-btn ${cat===c.key?'active':''}`} onClick={()=>setCat(c.key)}>
                {c.label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="no-results">No photos yet. Owner can add them from the panel.</p>
        ) : (
          /* CSS columns masonry: any number of photos, auto-fills beautifully */
          <div className="masonry">
            {filtered.map(item => (
              <div key={item.id} className="masonry-item" onClick={() => setLightbox(item)}>
                <img src={item.url} alt={item.caption || ''}
                  loading="lazy"
                  onError={() => handleError(item.id)}
                />
                {item.caption && (
                  <div className="masonry-overlay"><span>{item.caption}</span></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="lightbox" onClick={closeLB}>
          <button className="lb-close" onClick={() => setLightbox(null)}>×</button>
          {filtered.length > 1 && (
            <button className="lb-prev" onClick={e => { e.stopPropagation(); prev() }}>‹</button>
          )}
          <div className="lb-img-wrap" onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption} className="lb-img" />
            {lightbox.caption && <p className="lb-caption">{lightbox.caption}</p>}
          </div>
          {filtered.length > 1 && (
            <button className="lb-next" onClick={e => { e.stopPropagation(); next() }}>›</button>
          )}
        </div>
      )}
    </div>
  )

  function closeLB() { setLightbox(null) }
}
