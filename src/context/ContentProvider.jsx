import { createContext, useContext, useState, useEffect } from 'react'
import defaultContent from '../data/defaultContent'
import { getContent, setContent } from '../lib/db'
import { useLoading } from './LoadingProvider'

const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const [content, setLocalContent] = useState(null)
  const { markContentReady } = useLoading()

  useEffect(() => {
    async function load() {
      try {
        const saved = await getContent()
        if (saved) {
          setLocalContent(deepMerge(defaultContent, saved))
        } else {
          await setContent(defaultContent)
          setLocalContent(defaultContent)
        }
      } catch (err) {
        console.error('Content load error:', err)
        setLocalContent(defaultContent)
      } finally {
        // Signal the KO Loader that content is ready — it will now finish
        markContentReady()
      }
    }
    load()
  }, [])

  const updateSection = async (sectionKey, newData) => {
    const updated = { ...content, [sectionKey]: newData }
    setLocalContent(updated)
    const ok = await setContent(updated)
    if (!ok) console.warn('Failed to save to database')
    return ok
  }

  const resetToDefaults = async () => {
    setLocalContent(defaultContent)
    await setContent(defaultContent)
  }

  // No loading screen here — the KO Loader in Loader.jsx handles it
  // Render children even if content is null; pages guard with `if (!content) return null`
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


