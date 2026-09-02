import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useContent } from '../context/ContentProvider'
import './Story.css'

gsap.registerPlugin(ScrollTrigger)

export default function Story() {
  const { content } = useContent()
  if (!content) return null
  const { story, owner, trophies } = content
  return (
    <div className="page story-page">
      <StoryHero story={story} />
      {(story?.timeline || []).length > 0 && <Timeline story={story} />}
      <OwnerSection owner={owner} />
      {(owner?.achievements || []).length > 0 && <AchievementsSection owner={owner} />}
      {(trophies || []).length > 0 && <TrophiesStrip trophies={trophies} />}
    </div>
  )
}

function StoryHero({ story }) {
  const ref = useRef(null)
  useEffect(() => {
    gsap.from(ref.current?.children, { opacity:0, y:60, stagger:0.15, duration:0.9, ease:'power3.out',
      scrollTrigger:{ trigger:ref.current, start:'top 85%' } })
  }, [])
  return (
    <section className="story-hero">
      <div className="container" ref={ref}>
        <p className="section-label red">The Knockout Story</p>
        {story?.heading && <h1 className="sh-heading">{story.heading}</h1>}
        {story?.intro   && <p  className="sh-intro">{story.intro}</p>}
      </div>
    </section>
  )
}

function Timeline({ story }) {
  const lineRef = useRef(null)
  // Filter: only show nodes that have at least a year AND text
  const nodes = (story?.timeline || []).filter(n => n.year || n.text)

  useEffect(() => {
    if (!lineRef.current) return
    gsap.from(lineRef.current, {
      scaleY: 0, transformOrigin: 'top', ease: 'none',
      scrollTrigger: { trigger: '.timeline', start: 'top 80%', end: 'bottom 20%', scrub: true }
    })
    gsap.from('.tl-node', { opacity:0, y:50, duration:0.8, stagger:0.2, ease:'power3.out',
      scrollTrigger: { trigger: '.timeline', start: 'top 75%' } })
  }, [])

  return (
    <section className="timeline">
      <div className="tl-line" ref={lineRef} />
      <div className="container">
        {nodes.map((node, i) => (
          <div key={i} className={`tl-node ${i % 2 === 0 ? 'tl-left' : 'tl-right'}`}>
            <div className="tl-content">
              {node.year    && <div className="tl-year">{node.year}</div>}
              {node.heading && <h3 className="tl-heading">{node.heading}</h3>}
              {/* Text: any length — wraps naturally, section grows */}
              {node.text    && <p className="tl-text">{node.text}</p>}
            </div>
            {/* Image: only rendered if URL exists AND doesn't 404 */}
            {node.image && (
              <div className="tl-img-wrap">
                <img src={node.image} alt={node.heading || node.year}
                  className="tl-img"
                  onError={e => { e.target.parentElement.style.display = 'none' }} />
              </div>
            )}
            <div className="tl-dot" />
          </div>
        ))}
      </div>
    </section>
  )
}

function OwnerSection({ owner }) {
  const ref = useRef(null)
  useEffect(() => {
    gsap.from(ref.current?.querySelector('.owner-text'),     { opacity:0, x:60, duration:1, ease:'power3.out', scrollTrigger:{trigger:ref.current,start:'top 75%'} })
    gsap.from(ref.current?.querySelector('.owner-img-wrap'), { opacity:0, x:-60, duration:1, ease:'power3.out', scrollTrigger:{trigger:ref.current,start:'top 75%'} })
  }, [])

  if (!owner?.name && !owner?.bio) return null

  return (
    <section ref={ref} className="owner-section">
      <div className={`container ${owner?.image ? 'owner-grid' : 'owner-no-img'}`}>
        {owner?.image && (
          <div className="owner-img-wrap">
            <img src={owner.image} alt={owner.name} className="owner-img"
              onError={e => { e.target.parentElement.style.display = 'none' }} />
            <div className="owner-img-glow" />
          </div>
        )}
        <div className="owner-text">
          <p className="section-label red">Head Coach & Founder</p>
          {owner?.name  && <h2 className="owner-name">{owner.name}</h2>}
          {owner?.title && <p className="owner-title">{owner.title}</p>}
          {/* Bio: any length — wraps naturally, no overflow cut */}
          {owner?.bio   && <p className="owner-bio">{owner.bio}</p>}
        </div>
      </div>
    </section>
  )
}

function AchievementsSection({ owner }) {
  const ref = useRef(null)
  const achievements = (owner?.achievements || []).filter(a => a.title)
  if (!achievements.length) return null

  useEffect(() => {
    gsap.from(ref.current?.querySelectorAll('.ach-row'), { opacity:0, x:-30, stagger:0.1, duration:0.7, ease:'power3.out',
      scrollTrigger:{trigger:ref.current,start:'top 80%'} })
  }, [])

  return (
    <section ref={ref} className="ach-section">
      <div className="container">
        <p className="section-label red">Competition History</p>
        <h2 className="ach-heading">Championship Record.</h2>
        <div className="ach-list">
          {achievements.map((a, i) => (
            <div key={i} className="ach-row">
              <span className="ach-title">{a.title}</span>
              <span className="ach-dots" />
              {a.year && <span className="ach-year">{a.year}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrophiesStrip({ trophies }) {
  const valid = (trophies || []).filter(t => t.title)
  if (!valid.length) return null

  return (
    <section className="trophy-strip">
      <div className="container">
        <p className="section-label red">Honours & Awards</p>
        <h2 className="trophy-heading">The Cabinet.</h2>
      </div>
      {/* Horizontal scroll — any number of trophies, never wraps or overflows */}
      <div className="trophy-scroll-wrap">
        <div className="trophy-scroll">
          {valid.map(t => (
            <div key={t.id} className="trophy-card">
              {t.image && (
                <img src={t.image} alt={t.title} className="trophy-img"
                  onError={e => { e.target.style.display = 'none' }} />
              )}
              <div className="trophy-info">
                {t.level && <span className={`trophy-level level-${(t.level).toLowerCase()}`}>{t.level}</span>}
                <p className="trophy-title">{t.title}</p>
                {t.year  && <p className="trophy-year">{t.year}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
