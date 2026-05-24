import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseCountdownOptions {
  interval?: number
  immediate?: boolean
  onFinish?: () => void
}

/**
 * Countdown timer hook.
 *
 * @example
 * const { remaining, start, stop, isFinished } = useCountdown(60_000)
 */
export function useCountdown(
  durationMs: number,
  options: UseCountdownOptions = {},
): {
  remaining: number
  isFinished: boolean
  start: (newDurationMs?: number) => void
  stop: () => void
  reset: () => void
} {
  const { interval = 1000, immediate = true, onFinish } = options
  const [remaining, setRemaining] = useState(durationMs)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const start = useCallback(
    (newDurationMs?: number) => {
      stop()
      if (typeof newDurationMs === 'number') setRemaining(newDurationMs)
      timerRef.current = setInterval(() => {
        setRemaining((prev) => {
          const next = Math.max(0, prev - interval)
          if (next === 0) {
            stop()
            onFinishRef.current?.()
          }
          return next
        })
      }, interval)
    },
    [interval, stop],
  )

  const reset = useCallback(() => {
    stop()
    setRemaining(durationMs)
  }, [durationMs, stop])

  useEffect(() => {
    if (immediate) start()
    return stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { remaining, isFinished: remaining <= 0, start, stop, reset }
}
