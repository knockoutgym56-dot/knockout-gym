import { createContext, useContext, useState, useEffect } from 'react'
import defaultContent from '../data/defaultContent'
import { getContent, setContent } from '../lib/db'

// ─────────────────────────────────────────────────────────────────────────────
//  ContentProvider — reads site content from Supabase database.
//  Visitors everywhere see the same latest content.
//  Owner panel writes here → updates instantly everywhere.
// ─────────────────────────────────────────────────────────────────────────────

const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const [content, setLocalContent] = useState(null)
  const [loading, setLoading]      = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const saved = await getContent()
        if (saved) {
          // Deep merge — ensures new fields added to defaultContent always exist
          setLocalContent(deepMerge(defaultContent, saved))
        } else {
          // First ever visit — seed the database with default content
          await setContent(defaultContent)
          setLocalContent(defaultContent)
        }
      } catch (err) {
        console.error('Content load error:', err)
        setLocalContent(defaultContent)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Update one section → saves to cloud → all devices see the change
  const updateSection = async (sectionKey, newData) => {
    const updated = { ...content, [sectionKey]: newData }
    setLocalContent(updated)           // instant UI update
    const ok = await setContent(updated) // persist to Supabase
    if (!ok) console.warn('Failed to save to database')
    return ok
  }

  const resetToDefaults = async () => {
    setLocalContent(defaultContent)
    await setContent(defaultContent)
  }

  if (loading) {
    return (
      <div style={{
        position:'fixed', inset:0, background:'#060606', zIndex:99999,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:'sans-serif', color:'#c8102e',
        fontSize:'12px', letterSpacing:'6px', textTransform:'uppercase'
      }}>
        Loading…
      </div>
    )
  }

  return (
    <ContentContext.Provider value={{ content, updateSection, resetToDefaults }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be inside ContentProvider')
  return ctx
}

// Deep merge: use saved values where they exist, fill missing keys from defaults
function deepMerge(defaults, saved) {
  const result = { ...defaults }
  for (const key of Object.keys(saved)) {
    if (saved[key] !== null && typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
      result[key] = deepMerge(defaults[key] || {}, saved[key])
    } else {
      result[key] = saved[key]
    }
  }
  return result
}
