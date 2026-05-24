import { useCallback, useEffect, useState } from 'react'
import { isBrowser } from './utils'

/**
 * Stateful `localStorage` hook with JSON serialisation.
 *
 * @example
 * const [token, setToken] = useLocalStorage<string>('token', '')
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const read = useCallback((): T => {
    if (!isBrowser) return defaultValue
    const raw = window.localStorage.getItem(key)
    if (raw == null) return defaultValue
    try {
      return JSON.parse(raw) as T
    } catch {
      return defaultValue
    }
  }, [defaultValue, key])

  const [value, setValue] = useState<T>(read)

  const update = useCallback<(value: T | ((prev: T) => T)) => void>(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next
        if (isBrowser) {
          if (resolved == null) window.localStorage.removeItem(key)
          else window.localStorage.setItem(key, JSON.stringify(resolved))
        }
        return resolved
      })
    },
    [key],
  )

  useEffect(() => {
    if (!isBrowser) return
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setValue(read())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, read])

  return [value, update]
}
