# Vite + `@tailwindcss/vite` again, with a minimal `tw dev`

ADR-0003 moved playgrounds to the `@tailwindcss/browser@4` CDN and a hand-rolled live-reload server. ADR-0005 removed `tw dev` entirely in favor of `tw open` + `file://`, because CDN playgrounds worked standalone and the dev-server subsystem (live-server, config, browser/editor spawn) was heavier than the utility-class workflow justified.

We reverse ADR-0003 and partially reverse ADR-0005. Playgrounds are again a two-file minimum — `index.html` plus `src/main.css` with `@import "tailwindcss"` — compiled by Vite + `@tailwindcss/vite` when the user runs `tw dev`. `tw open` stays for revealing the folder in the file manager; it does not start a server. Preview requires `tw dev`; `file://` no longer works.

We deliberately do **not** bring back the PRD's full config surface. No `tw config` command, no browser auto-open, no `--open` / `--no-open` flags. `tw dev` prints the localhost URL; the user opens it manually unless they press a **Dev shortcut** in an interactive terminal. Editor launch is available via `e` / `E` shortcuts only — not on start. The server binds `127.0.0.1` only. Legacy CDN playgrounds are not detected or migrated — Vite starts over whatever is on disk.

When stdin is a TTY, `tw dev` prints a **Shortcuts** list after the URL: `o` opens the served URL in the default browser; `O` reveals the playground folder (same as `tw open`); `e` prompts for an editor command (blank prompt, no pre-fill) and saves it to `$TW_HOME/config.json`; `E` opens via the saved `editor` value from that file. Each press prints a one-line acknowledgment; spawn failures warn without stopping the server. No shortcuts list or key listener when stdin is not a TTY (CI, piped). Still no auto-open on start — shortcuts are opt-in per keystroke.

**Config** is minimal: a lazy `$TW_HOME/config.json` with a single `editor` key, written only when the user completes an `e` prompt. No `tw config` command; browser behaviour is not configured. This is narrower than the PRD's config wizard — editor persistence only, because retyping `cursor` every session was friction `E` could not solve across runs.

## Consequences

- `tw` again ships `vite`, `tailwindcss`, and `@tailwindcss/vite` (~40MB install). `tw` pins the Tailwind version; playgrounds inherit it on each `tw dev`.
- New playgrounds cannot be previewed without `tw dev` (or the user's own Vite setup).
- Users who relied on CDN + `file://` must recreate playgrounds (`tw rm <name> && tw add <name>`) or hand-migrate to the two-file shape.
- ADR-0003 is superseded. ADR-0005's removal of `tw dev` is reversed; its removal of the full config/live-server stack remains in effect.
