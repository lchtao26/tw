# Tailwind via Vite + `@tailwindcss/vite`, not the browser CDN

> _Superseded by [ADR-0003](./0003-tailwind-via-browser-cdn.md). The fidelity rationale below stopped paying its way once `tw` was used in practice for utility-class doodling only. The decision recorded here is preserved as history._

The original brief said "delegate scripts to the CDN" — generated playgrounds would include `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>` and Tailwind would compile in the browser at runtime. We initially adopted that, then reversed: `tw` ships `vite`, `tailwindcss`, and `@tailwindcss/vite` as direct dependencies, and `tw dev` uses Vite's Node API to serve the playground with the Tailwind plugin pre-wired. The reversal trades playground portability for the canonical Tailwind v4 experience: real class-name scanning, dev-time CSS, sub-100ms HMR, no flash of unstyled content, and a CSS-native `@theme` config story. Playgrounds are meant to teach what you'd actually use; the runtime CDN was the wrong fidelity.

## Consequences

- An `index.html` no longer renders correctly via `file://` — playgrounds are coupled to `tw` and Vite at runtime.
- Playground HTML is dramatically shorter: no `<script>` tag for Tailwind, no inline `<style type="text/tailwindcss">@theme>` block. Tailwind is consumed via `@import "tailwindcss"` in `src/main.css`.
- `tw` carries the Tailwind version, not each playground. Old playgrounds get whatever Tailwind ships with the current `tw`. Acceptable: playgrounds are short-lived.
- Adding `vite` and friends as direct dependencies costs ~40MB on install. Equivalent to the `npx browser-sync` cache we would have paid anyway, and more deliberate.
