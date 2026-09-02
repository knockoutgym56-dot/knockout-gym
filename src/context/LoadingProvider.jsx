import { createContext, useContext, useState } from 'react'

const LoadingContext = createContext(null)

export function LoadingProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false)

  const finishLoading = () => setIsLoaded(true)

  return (
    <LoadingContext.Provider value={{ isLoaded, finishLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  return useContext(LoadingContext)
}
