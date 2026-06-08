# Agent instructions

This folder is a **tw playground** — a dependency-free Tailwind scratchpad. Tailwind is compiled by `tw dev`; there is no `package.json` and nothing to install.

## Edit here

- Put HTML structure and Tailwind utility classes in `index.html`.
- Do not create React, Vue, or other framework setup.

## Wiring (leave alone unless asked)

- `src/main.css` holds Tailwind import, `@theme`, bundled fonts, and the icon plugin.
- Only edit `main.css` when the user explicitly asks to change theme tokens, fonts, or global base styles.

## Already wired

- **Fonts:** `font-sans` (Inter Variable), `font-display` (Lexend Variable) — configured in `main.css`; do not add font packages or CDN links.
- **Icons:** use dynamic icon classes on a host element, e.g. `<span class="icon-[lucide--heart]"></span>`. Full Iconify catalogue is available; do not install icon libraries.

## Don't

- No `package.json`, `npm install`, Vite config, Tailwind config, or JS frameworks.
- No browser CDN for Tailwind — compilation is handled by `tw dev`.

## Extra files

- Images or a small plain script are fine when the user explicitly asks.
- Still no package manager or build toolchain.

## Preview

- Preview requires `tw dev` running — not `file://`, not `npm run dev`.
- Do not start or stop the dev server; edit files and HMR applies changes when Dev is already up.
