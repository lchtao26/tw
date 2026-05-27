# tw

`tw` is a personal CLI for creating and running tiny, throwaway Tailwind CSS experiments. It owns a user-global library of named playgrounds and serves them on demand via a Vite-powered dev loop.

## Language

**Playground**:
A slug-named scratchpad for Tailwind experimentation. Lives at `$TW_HOME/playgrounds/<name>/` and contains exactly `index.html` and `src/main.css`.
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

A playground's **name** is a slug matching `^[a-z0-9][a-z0-9-]*$`. Names appear in filenames, in URLs at dev time, and as arguments to every subcommand. Invalid names are rejected, not auto-slugified.

## Example dialogue

> **dev (Monday):** "I added a `hover-tricks` playground while working in `~/proj-a`. Where did it land?"
> **dev (Wednesday):** "In the **store**. `~/.tw/playgrounds/hover-tricks/`. The store is user-global — it doesn't matter what CWD you ran `tw add` from."
>
> **dev:** "Can I keep a playground inside this project's repo?"
> **dev:** "No. The store is deliberately not per-project — that's what makes a playground a *playground* and not a *project artifact*. If you want it committed somewhere, `cp -r $(tw path hover-tricks) ./somewhere/`."
>
> **dev:** "Why doesn't `index.html` render when I just open it in a browser?"
> **dev:** "It's not standalone HTML. Tailwind is compiled by Vite via `@tailwindcss/vite`, not by a CDN script. Use `tw dev hover-tricks` instead of `file://`."
