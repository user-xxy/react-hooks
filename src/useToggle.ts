import { useCallback, useState } from 'react'

/**
 * Boolean toggle hook.
 *
 * @example
 * const [open, { toggle, setTrue, setFalse }] = useToggle()
 */
export function useToggle(initial = false): [
  boolean,
  { toggle: () => void; setTrue: () => void; setFalse: () => void; setValue: (v: boolean) => void },
] {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue((v) => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])
  return [value, { toggle, setTrue, setFalse, setValue }]
}
