# Tailwind via `@tailwindcss/browser@4` CDN and a hand-rolled live-reload server

> _Superseded by [ADR-0006](./0006-vite-dev-server-minimal.md). Playgrounds again use Vite + `@tailwindcss/vite`; the CDN layout is no longer generated._

ADR-0002 chose Vite + `@tailwindcss/vite` so playgrounds matched real Tailwind-in-a-Vite-app fidelity: source-file scanning, `@theme` in CSS, sub-100ms HMR, no FOUC. In practice, `tw` is used for utility-class doodling against static HTML — not for prototyping `@theme`, plugins, or paste-into-Next.js fragments. That fidelity no longer pays for the ~40MB install and the resolver bugs that come from serving a depless playground root through Vite.

We reverse ADR-0002. A playground is a single `index.html` with `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>` in `<head>`. `tw dev` runs a tiny hand-rolled HTTP server (`node:http`) with live reload via `chokidar` + `ws` — not Vite. The user never installs toolchain deps per playground; `chokidar` and `ws` ship as normal `tw` dependencies the same way `@clack/prompts` does today.

## Consequences

- Playgrounds render via `file://` without `tw`. `tw dev` exists for auto-reload during layout iteration, not because the HTML is broken standalone.
- No `@theme` or `@apply` in external CSS files. Custom tokens belong in an inline `<style type="text/tailwindcss">` block inside `index.html` if ever needed — acceptable for the utility-class use case.
- `tw` no longer pins the Tailwind version. Playgrounds ride whatever `@4` resolves to on jsdelivr today. Acceptable for short-lived scratchpads.
- Install footprint drops from ~40MB (`vite`, `tailwindcss`, `@tailwindcss/vite`) to ~3MB (`chokidar`, `ws`).
- First paint has a brief FOUC while the CDN script compiles classes in the browser.
- Old playgrounds with `src/main.css` and `@import "tailwindcss"` are not migrated. `tw rm <name> && tw add <name>` is the recovery path.
