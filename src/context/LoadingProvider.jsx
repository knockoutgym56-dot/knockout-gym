import { createContext, useContext, useState, useCallback } from 'react'

const LoadingContext = createContext(null)

export function LoadingProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false)
  // contentReady: set to true by ContentProvider once Supabase fetch is done
  const [contentReady, setContentReady] = useState(false)

  const finishLoading = useCallback(() => setIsLoaded(true), [])
  const markContentReady = useCallback(() => setContentReady(true), [])

  return (
    <LoadingContext.Provider value={{ isLoaded, finishLoading, contentReady, markContentReady }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  return useContext(LoadingContext)
}
