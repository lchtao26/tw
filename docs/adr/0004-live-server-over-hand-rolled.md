# `@compodoc/live-server` over a hand-rolled live-reload server

ADR-0003 chose a tiny hand-rolled HTTP server (`node:http`) with live reload via `chokidar` + `ws` to keep `tw`'s install footprint small (~3MB) and avoid coupling to a third-party dev-server stack. That trade-off held while the server was small; it no longer does. The hand-rolled implementation grew to ~200 lines covering MIME types, path traversal guards, HTML reload-script injection, WebSocket upgrade handling, debounced broadcasts, and graceful shutdown — all of which `@compodoc/live-server` already provides and maintains.

We amend ADR-0003's server choice only. Tailwind via `@tailwindcss/browser@4` CDN remains the source of truth for how playgrounds compile CSS.

We pick `@compodoc/live-server` specifically — not the unscoped `live-server` package — because the original is unmaintained and carries stale transitive dependencies.

## Consequences

- `chokidar` and `ws` are no longer direct `tw` dependencies; they arrive transitively via `@compodoc/live-server`. Install footprint grows modestly compared to the hand-rolled stack.
- The server binds to `0.0.0.0` (LAN-accessible while `tw dev` runs) instead of loopback-only `127.0.0.1`. The URL printed to the user still uses `127.0.0.1`.
- CSS changes can be injected without a full page reload — a bonus from live-server's default behavior.
- `lib/server.js` stays a thin adapter exposing `startServer({ root, port }) -> { url, close }` so `lib/commands/dev.js` is unchanged.
