import { createContext, useContext, useState, useCallback, useRef } from 'react'

const PageTransitionContext = createContext()

export function PageTransitionProvider({ children }) {
  console.log('PROVIDER MOUNTED')
  const [transitioning, setTransitioning] = useState(false)
  const readyResolveRef = useRef(null)

  // Called by AppLayout when starting a nav — returns a promise that resolves
  // once the destination page calls reportReady()
  const startTransition = useCallback(() => {
    setTransitioning(true)
    return new Promise((resolve) => {
      readyResolveRef.current = resolve
    })
  }, [])

  // Called by individual pages once their data has finished loading
  const reportReady = useCallback(() => {
    if (readyResolveRef.current) {
      readyResolveRef.current()
      readyResolveRef.current = null
    }
  }, [])

  const endTransition = useCallback(() => {
    setTransitioning(false)
  }, [])

  return (
    <PageTransitionContext.Provider value={{ transitioning, startTransition, reportReady, endTransition }}>
      {children}
    </PageTransitionContext.Provider>
  )
}

export const usePageTransition = () => useContext(PageTransitionContext)
