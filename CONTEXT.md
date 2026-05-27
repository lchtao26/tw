# tw

`tw` is a personal CLI for creating and running tiny, throwaway Tailwind CSS experiments. It owns a user-global library of named playgrounds and serves them on demand with live reload.

## Language

**Playground**:
A named scratchpad for Tailwind experimentation. Lives at `$TW_HOME/playgrounds/<name>/` and contains a single `index.html` that loads Tailwind from a browser CDN. The name is stored as-is — it is the folder name on disk.
_Avoid_: project, template, sample, demo, sketch

**Store**:
The directory holding all playgrounds — `$TW_HOME/playgrounds/`. Singular across a user. Not per-project, not per-CWD.
_Avoid_: workspace, library, registry, collection

**`$TW_HOME`**:
Environment variable pointing at `tw`'s root data directory. Defaults to `~/.tw`. Holds the store and the config file.
_Avoid_: home, root, data dir

**Config**:
The single JSON file at `$TW_HOME/config.json` controlling `tw dev`'s default behavior. Two fields: `openBrowserOnDev` and `openEditorOnDev`. Lazily created — defaults apply when the file is absent.
_Avoid_: settings, preferences, profile

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
> **dev:** "Yes. Tailwind loads from a CDN script in the file itself. `tw dev hover-tricks` only adds auto-reload on save — use it when you're iterating, not because `file://` is broken."
