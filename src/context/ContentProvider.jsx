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
  // ── Start with defaultContent so children NEVER receive null ────────────
  // The Loader overlay covers the page while we fetch real data from Supabase.
  // No separate loading screen needed here — Loader IS the loading screen.
  const [content, setLocalContent] = useState(defaultContent)
  const [contentReady, setContentReady] = useState(false)

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
          // content is already defaultContent, no extra setState needed
        }
      } catch (err) {
        console.error('Content load error:', err)
        // content is already defaultContent — no action needed
      } finally {
        setContentReady(true)
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

  // ── No loading screen here — Loader handles the full loading UX ──────────
  // Previously this had a "Loading…" div that blocked the Loader from mounting,
  // causing two separate loading experiences. Now the Loader is the only one.

  return (
    <ContentContext.Provider value={{ content, updateSection, resetToDefaults, contentReady }}>
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
