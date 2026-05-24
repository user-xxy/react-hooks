import { useEffect, useState } from 'react'
import { isBrowser, isMobileViewport } from './utils'

/**
 * Reactive flag that toggles when the viewport crosses `maxWidth`.
 *
 * @example
 * const isMobile = useIsMobile()
 */
export function useIsMobile(maxWidth = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => isMobileViewport(maxWidth))
  useEffect(() => {
    if (!isBrowser) return
    const onResize = () => setIsMobile(isMobileViewport(maxWidth))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [maxWidth])
  return isMobile
}
