export const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

export function isMobileViewport(maxWidth = 768): boolean {
  if (!isBrowser) return false
  const width =
    window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
  return width < maxWidth
}

export function getLatencyColor(latency: number): string {
  if (latency <= 0) return '#A9A9A9'
  if (latency <= 50) return '#32CD32'
  if (latency <= 100) return '#FFD700'
  if (latency <= 200) return '#FF8C00'
  return '#DC143C'
}
