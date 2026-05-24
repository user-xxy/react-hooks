# yhc-dev-react-hooks

React hooks for browser apps, distilled from real-world admin, H5, and
mini-program projects.

```bash
pnpm add yhc-dev-react-hooks
# peer dependency
pnpm add react
```

## API

### `useIsMobile(maxWidth?)`

```tsx
const isMobile = useIsMobile()
return isMobile ? <Mobile /> : <Desktop />
```

### `useToggle(initial?)`

```tsx
const [open, { toggle, setTrue, setFalse }] = useToggle(false)
```

### `useWebSocket(options)`

```tsx
const { status, data, send } = useWebSocket<ChatMessage, ChatPayload>({
  url: 'wss://chat.example.com',
  heartbeatInterval: 30_000,
  heartbeatMessage: () => JSON.stringify({ event: 'ping' }),
  onMessage: (msg) => console.log(msg),
})
```

Heartbeat, auto-reconnect, manual close, and callback refs are built in.

### `useCountdown(durationMs, options?)`

```tsx
const { remaining, isFinished, start, stop, reset } = useCountdown(60_000)
```

### `useLatencyColor(latency)`

```tsx
const color = useLatencyColor(latencyMs)
```

### `useLocalStorage(key, defaultValue)`

```tsx
const [token, setToken] = useLocalStorage<string>('token', '')
```

The hook subscribes to the `storage` event so multiple tabs stay in sync.

## Develop

```bash
pnpm install
pnpm typecheck
pnpm build
```

## Publish

Publishing is handled by GitHub Actions:

- npm registry: `yhc-dev-react-hooks`
- GitHub Packages: `@user-xxy/yhc-dev-react-hooks`

Add an `NPM_TOKEN` repository secret with publish permission, then either create
a GitHub Release or run the `Publish packages` workflow manually.

## License

MIT
