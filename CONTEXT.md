# tw

`tw` is a personal CLI for creating and opening tiny, throwaway Tailwind CSS experiments. It owns a user-global library of named playgrounds and reveals them in the file manager on demand.

## Language

**Playground**:
A named scratchpad for Tailwind experimentation. Lives at `$TW_HOME/playgrounds/<name>/` and contains a single `index.html` that loads Tailwind from a browser CDN. The name is stored as-is — it is the folder name on disk.
_Avoid_: project, template, sample, demo, sketch

**Store**:
The directory holding all playgrounds — `$TW_HOME/playgrounds/`. Singular across a user. Not per-project, not per-CWD.
_Avoid_: workspace, library, registry, collection

**`$TW_HOME`**:
Environment variable pointing at `tw`'s root data directory. Defaults to `~/.tw`. Holds the store.
_Avoid_: home, root, data dir

**Open**:
The `tw open` command. Picks a playground (if name omitted), then **reveals its folder** in the OS file manager (Finder on macOS, Explorer on Windows, default file manager on Linux). Exits immediately. Folder-only — no browser flag, no opener picker, no dev server, no IDE integration. Preview by double-clicking `index.html` in the revealed folder. Replaces the removed `tw dev` command.
_Avoid_: dev, serve, launch, editor, browser

**Path**:
The `tw path` command. Prints a playground's absolute directory path to stdout. For scripting (`cd`, `cp`, …). Complements **Open** — `tw open` is the GUI path, `tw path` is the stdout path. Both kept.
_Avoid_: location, dir

## Constraints

A playground's **name** is any non-empty, filesystem-safe label. It becomes the directory name under the store. Names with path separators, traversal segments, or other unsafe characters are rejected — never auto-slugified or silently rewritten.

## Example dialogue

> **dev (Monday):** "I added a `hover-tricks` playground while working in `~/proj-a`. Where did it land?"
> **dev (Wednesday):** "In the **store**. `~/.tw/playgrounds/hover-tricks/`. The store is user-global — it doesn't matter what CWD you ran `tw add` from."
>
> **dev:** "Can I keep a playground inside this project's repo?"
> **dev:** "No. The store is deliberately not per-project — that's what makes a playground a *playground* and not a *project artifact*. If you want it committed somewhere, `cp -r $(tw path hover-tricks) ./somewhere/`."
>
> **dev:** "Can I just double-click `index.html`?"
> **dev:** "Yes — run `tw open hover-tricks` to reveal the folder in Finder, then open `index.html`. Tailwind loads from a CDN script in the file itself; no server required."
