import { useMemo } from 'react'
import { getLatencyColor } from './utils'

/**
 * Memoised latency color from a numeric latency value.
 *
 * @example
 * const color = useLatencyColor(latencyMs)
 */
export function useLatencyColor(latency: number): string {
  return useMemo(() => getLatencyColor(latency), [latency])
}
