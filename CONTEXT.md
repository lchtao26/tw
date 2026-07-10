# tw

`tw` is a personal CLI for creating and opening tiny, throwaway Tailwind CSS experiments. It owns a user-global library of named playgrounds, serves them with Vite on `tw dev`, and reveals their folders with `tw open`.

## Language

**Playground**:
A named scratchpad for Tailwind experimentation. Lives at `$TW_HOME/playgrounds/<name>/` as `index.html` plus `src/main.css` with `@import "tailwindcss"`, and **Agent instructions** on new playgrounds. **Markup** — Tailwind utility classes and HTML structure — belongs in `index.html`. **Wiring** — Tailwind import, `@theme`, **bundled fonts**, **bundled icons** — belongs in `src/main.css` unless the user explicitly asks to change theme or fonts. Assets and icon data live with `tw`, not in the playground folder. Default fonts: Inter Variable on the sans stack, Lexend Variable on the display stack. Tailwind is compiled by `tw`'s bundled Vite toolchain — not a browser CDN. Preview requires `tw dev`; `file://` does not work. The name is stored as-is — it is the folder name on disk.
_Avoid_: project, template, sample, demo, sketch

**Agent instructions**:
`AGENT.md` shipped with new playgrounds. Opens with a one-line **tw playground** identity so agents know this is not a normal npm project. Agent-targeted, editor-agnostic guidance for any coding agent working in a **Playground** — short headed sections (~30–40 lines), not a flat rule list or tutorial. Put utilities in `index.html`, leave `src/main.css` for wiring, never add a package manager or build toolchain (`package.json`, Vite/Tailwind config, frameworks); **Dev** already compiles Tailwind. Documents **bundled fonts** (`font-sans`, `font-display`) and **bundled icons** (**dynamic icon classes** only — no icon packages). Extra static files (images, a small script) are fine when the user explicitly asks. Preview is the human's job: **Dev** must be running (`tw dev`); agents do not start or stop the server — they edit files and HMR applies changes.
_Avoid_: AGENTS.md, README, rules file

**Store**:
The directory holding all playgrounds — `$TW_HOME/playgrounds/`. Singular across a user. Not per-project, not per-CWD.
_Avoid_: workspace, library, registry, collection

**`$TW_HOME`**:
Environment variable pointing at `tw`'s root data directory. Defaults to `~/.tw`. Holds the store and, when set, a minimal **Config** file for the user's editor preference.
_Avoid_: home, root, data dir

**Config**:
Optional `$TW_HOME/config.json` with a single `editor` key — the command used to open a playground folder (e.g. `"cursor"`). Created lazily when the user saves an editor via **Dev shortcuts**. No `tw config` command; not used for browser or other settings.
_Avoid_: settings, preferences, config.json

**Open**:
The `tw open` command. Picks a playground (if name omitted), then **reveals its folder** in the OS file manager (Finder on macOS, Explorer on Windows, default file manager on Linux). Exits immediately. Folder-only — no browser, no dev server, no IDE integration. Complements **Dev** when you want the files visible without starting Vite.
_Avoid_: dev, serve, launch

**Dev**:
The `tw dev` command. Picks a playground (if name omitted), starts Vite + Tailwind with HMR over that playground's root, prints the served URL, and blocks until Ctrl-C stops it. Preview path for playgrounds — required because Tailwind is not compiled for `file://`. Binds localhost only — not LAN-accessible. While running in an interactive terminal, on-demand **Dev shortcuts** open the browser (`o`), reveal the folder (`O`), or launch an editor (`e` / `E`) — no auto-open on start. Startup prints a titled **Shortcuts** list when stdin is a TTY. Standalone **Open** still works without a running server.
_Avoid_: open, serve, start

**Dev shortcuts**:
Keystrokes available while **Dev** is running. `o` opens the served URL in the default browser; `O` reveals the playground folder ("reveal in folder" — same outcome as **Open**). `e` prompts for an editor command with a blank line (no pre-fill from **Config**; empty input or Ctrl-C cancels the prompt silently) and saves the result to **Config**; `E` opens via the saved editor from **Config** — if none yet, prints a one-line hint to press `e` first. Ctrl-C outside a prompt stops **Dev**. Each action press prints a one-line acknowledgment; spawn failures warn without stopping **Dev**.
_Avoid_: hotkeys, bindings

**Path**:
The `tw path` command. Prints a playground's absolute directory path to stdout. For scripting (`cd`, `cp`, …). Complements **Open** — `tw open` is the GUI path, `tw path` is the stdout path. Both kept.
_Avoid_: location, dir

**Bundled fonts**:
Variable faces shipped with `tw` and wired into new playgrounds' `src/main.css`. Playgrounds declare them; **Dev** resolves `@fontsource-variable/*` imports from `tw`'s own dependencies — playgrounds stay dependency-free. The default template sets Inter Variable on `--font-sans` (`font-sans`) and Lexend Variable on `--font-display` (`font-display`). Swapping or adding faces works when that package is also shipped with `tw`; static `@fontsource/*` imports are out of scope. Users override or remove bundled fonts by editing `main.css` like any other scratchpad content.
_Avoid_: Fontsource (implementation name), webfont package, npm dep

**Bundled icons**:
Iconify for Tailwind, shipped with `tw`. New playgrounds enable the plugin in `src/main.css`; **Dev** resolves the plugin and full open-source icon catalogue from `tw`'s dependencies — playgrounds stay dependency-free. Icons are written in HTML with **dynamic icon classes** only (e.g. `icon-[lucide--heart]`). Only icons actually used in a playground's HTML get CSS; the catalogue is breadth, not per-playground weight. Users remove the plugin line or stop using icon classes like any other scratchpad edit.
_Avoid_: Iconify (product name in user docs), web component, npm dep per playground, clean selector (`mdi-light--home` without `icon-[…]`)

**Dynamic icon class**:
Tailwind utility shaped `icon-[{prefix}--{name}]` on a host element (commonly `<span>`). `{prefix}` and `{name}` match an Iconify set entry (e.g. `lucide--heart`). Monotone icons follow text color; colored sets render as-is. Copy from Iconify's "CSS → Tailwind CSS" snippet. Not the shorter **clean selector** form (`{prefix}--{name}` plus `iconify`) — that requires a fixed prefix list and is out of scope for the default template.
_Avoid_: icon class, icon utility, `iconify-icon`

## Constraints

A playground's **name** is any non-empty, filesystem-safe label. It becomes the directory name under the store. Names with path separators, traversal segments, or other unsafe characters are rejected — never auto-slugified or silently rewritten.

Legacy playgrounds created under the CDN layout are not detected or migrated. `tw dev` starts Vite over whatever is on disk. Template changes (e.g. **bundled fonts**, **bundled icons**) apply only to new playgrounds from `tw add` — no backfill for existing ones.

## Example dialogue

> **dev (Monday):** "I added a `hover-tricks` playground while working in `~/proj-a`. Where did it land?"
> **dev (Wednesday):** "In the **store**. `~/.tw/playgrounds/hover-tricks/`. The store is user-global — it doesn't matter what CWD you ran `tw add` from."
>
> **dev:** "Can I keep a playground inside this project's repo?"
> **dev:** "No. The store is deliberately not per-project — that's what makes a playground a _playground_ and not a _project artifact_. If you want it committed somewhere, `cp -r $(tw path hover-tricks) ./somewhere/`."
>
> **dev:** "Can I just double-click `index.html`?"
> **dev:** "No — Tailwind compiles through Vite. Run `tw dev hover-tricks` to preview with HMR. Use `tw open hover-tricks` if you just want the folder in Finder."
