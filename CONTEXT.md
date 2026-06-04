# tw

`tw` is a personal CLI for creating and opening tiny, throwaway Tailwind CSS experiments. It owns a user-global library of named playgrounds, serves them with Vite on `tw dev`, and reveals their folders with `tw open`.

## Language

**Playground**:
A named scratchpad for Tailwind experimentation. Lives at `$TW_HOME/playgrounds/<name>/` as a two-file minimum: `index.html` plus `src/main.css` with `@import "tailwindcss"`. Tailwind is compiled by `tw`'s bundled Vite toolchain — not a browser CDN. Preview requires `tw dev`; `file://` does not work. The name is stored as-is — it is the folder name on disk.
_Avoid_: project, template, sample, demo, sketch

**Store**:
The directory holding all playgrounds — `$TW_HOME/playgrounds/`. Singular across a user. Not per-project, not per-CWD.
_Avoid_: workspace, library, registry, collection

**`$TW_HOME`**:
Environment variable pointing at `tw`'s root data directory. Defaults to `~/.tw`. Holds the store.
_Avoid_: home, root, data dir

**Open**:
The `tw open` command. Picks a playground (if name omitted), then **reveals its folder** in the OS file manager (Finder on macOS, Explorer on Windows, default file manager on Linux). Exits immediately. Folder-only — no browser, no dev server, no IDE integration. Complements **Dev** when you want the files visible without starting Vite.
_Avoid_: dev, serve, launch

**Dev**:
The `tw dev` command. Picks a playground (if name omitted), starts Vite + Tailwind with HMR over that playground's root, prints the served URL, and blocks until Ctrl-C. Preview path for playgrounds — required because Tailwind is not compiled for `file://`. Binds localhost only — not LAN-accessible. Does not reveal the folder; use **Open** or `tw path` for that. No `$TW_HOME/config.json`, no editor spawn, no browser auto-open — the user opens the printed URL themselves.
_Avoid_: open, serve, start

**Path**:
The `tw path` command. Prints a playground's absolute directory path to stdout. For scripting (`cd`, `cp`, …). Complements **Open** — `tw open` is the GUI path, `tw path` is the stdout path. Both kept.
_Avoid_: location, dir

## Constraints

A playground's **name** is any non-empty, filesystem-safe label. It becomes the directory name under the store. Names with path separators, traversal segments, or other unsafe characters are rejected — never auto-slugified or silently rewritten.

Legacy playgrounds created under the CDN layout are not detected or migrated. `tw dev` starts Vite over whatever is on disk.

## Example dialogue

> **dev (Monday):** "I added a `hover-tricks` playground while working in `~/proj-a`. Where did it land?"
> **dev (Wednesday):** "In the **store**. `~/.tw/playgrounds/hover-tricks/`. The store is user-global — it doesn't matter what CWD you ran `tw add` from."
>
> **dev:** "Can I keep a playground inside this project's repo?"
> **dev:** "No. The store is deliberately not per-project — that's what makes a playground a *playground* and not a *project artifact*. If you want it committed somewhere, `cp -r $(tw path hover-tricks) ./somewhere/`."
>
> **dev:** "Can I just double-click `index.html`?"
> **dev:** "No — Tailwind compiles through Vite. Run `tw dev hover-tricks` to preview with HMR. Use `tw open hover-tricks` if you just want the folder in Finder."
