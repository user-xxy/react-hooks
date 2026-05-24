import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseWebSocketOptions<TIn = unknown, TOut = unknown> {
  url: string
  protocols?: string | string[]
  immediate?: boolean
  autoReconnect?: boolean
  reconnectInterval?: number
  reconnectAttempts?: number
  heartbeatInterval?: number
  heartbeatMessage?: () => string | ArrayBufferLike | Blob | ArrayBufferView
  parse?: (raw: string | ArrayBuffer | Blob) => TIn
  serialize?: (value: TOut) => string | ArrayBufferLike | Blob | ArrayBufferView
  onOpen?: (ws: WebSocket) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  onMessage?: (data: TIn, raw: MessageEvent) => void
}

export type WsStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'

/**
 * A WebSocket client with auto-reconnect and heartbeat.
 *
 * @example
 * const { status, data, send } = useWebSocket<ChatMessage>({
 *   url: 'wss://chat.example.com',
 *   onMessage: (m) => console.log(m),
 * })
 */
export function useWebSocket<TIn = unknown, TOut = unknown>(
  options: UseWebSocketOptions<TIn, TOut>,
): {
  status: WsStatus
  data: TIn | null
  send: (value: TOut) => boolean
  open: () => void
  close: (code?: number, reason?: string) => void
} {
  const {
    url,
    protocols,
    immediate = true,
    autoReconnect = true,
    reconnectInterval = 2000,
    reconnectAttempts = Infinity,
    heartbeatInterval = 60_000,
    heartbeatMessage = () => 'ping',
    parse,
    serialize,
    onOpen,
    onClose,
    onError,
    onMessage,
  } = options

  const [status, setStatus] = useState<WsStatus>('CLOSED')
  const [data, setData] = useState<TIn | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const attemptsRef = useRef(0)
  const manuallyClosedRef = useRef(false)
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hold the latest callbacks in refs so reconnects pick up the newest versions
  // without forcing the consumer to memoise.
  const callbacksRef = useRef({ onOpen, onClose, onError, onMessage, parse, serialize, heartbeatMessage })
  callbacksRef.current = { onOpen, onClose, onError, onMessage, parse, serialize, heartbeatMessage }

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current)
      heartbeatTimerRef.current = null
    }
  }, [])

  const startHeartbeat = useCallback(() => {
    stopHeartbeat()
    if (!heartbeatInterval) return
    heartbeatTimerRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(callbacksRef.current.heartbeatMessage!())
      }
    }, heartbeatInterval)
  }, [heartbeatInterval, stopHeartbeat])

  const open = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) return
    manuallyClosedRef.current = false
    setStatus('CONNECTING')
    const socket = new WebSocket(url, protocols)
    wsRef.current = socket

    socket.onopen = () => {
      setStatus('OPEN')
      attemptsRef.current = 0
      startHeartbeat()
      callbacksRef.current.onOpen?.(socket)
    }
    socket.onmessage = (event) => {
      try {
        const parser = callbacksRef.current.parse ?? defaultParse
        const parsed = parser(event.data) as TIn
        setData(parsed)
        callbacksRef.current.onMessage?.(parsed, event)
      } catch (err) {
        console.warn('[useWebSocket] parse error:', err)
      }
    }
    socket.onerror = (event) => callbacksRef.current.onError?.(event)
    socket.onclose = (event) => {
      stopHeartbeat()
      setStatus('CLOSED')
      wsRef.current = null
      callbacksRef.current.onClose?.(event)
      if (!manuallyClosedRef.current && autoReconnect && attemptsRef.current < reconnectAttempts) {
        attemptsRef.current++
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = setTimeout(open, reconnectInterval)
      }
    }
  }, [url, protocols, autoReconnect, reconnectAttempts, reconnectInterval, startHeartbeat, stopHeartbeat])

  const close = useCallback((code?: number, reason?: string) => {
    manuallyClosedRef.current = true
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
    stopHeartbeat()
    if (wsRef.current) {
      setStatus('CLOSING')
      wsRef.current.close(code, reason)
    }
  }, [stopHeartbeat])

  const send = useCallback((value: TOut): boolean => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return false
    const serializer = callbacksRef.current.serialize ?? defaultSerialize
    wsRef.current.send(serializer(value))
    return true
  }, [])

  useEffect(() => {
    if (immediate) open()
    return () => close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  return { status, data, send, open, close }
}

function defaultParse(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

function defaultSerialize(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value)
}
