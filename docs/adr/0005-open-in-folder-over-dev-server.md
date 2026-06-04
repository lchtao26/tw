# `tw open` (reveal in folder) over a live-reload dev server

> _Partially superseded by [ADR-0006](./0006-vite-dev-server-minimal.md). `tw dev` is back (Vite + Tailwind HMR). `tw open` remains. Config and live-server removal below stay in effect._

ADR-0003 and ADR-0004 established that playgrounds compile Tailwind via the `@tailwindcss/browser@4` CDN and work standalone over `file://`. `tw dev` existed only to add auto-reload during layout iteration — a long-running HTTP server (`@compodoc/live-server`), browser auto-open, optional IDE launch, and a `$TW_HOME/config.json` for defaults.

We reverse the server half of that story. `tw dev` is removed. `tw open [name]` reveals the playground folder in the OS file manager and exits. Preview is a double-click on `index.html`. `tw config` is removed — there are no per-user open defaults left to configure. `tw path` stays for scripting.

The live-reload server was the most complex subsystem in `tw` (~90 transitive packages, a blocking process, platform-specific browser/editor spawn, config surface) serving a workflow that `file://` already covers. Playgrounds are utility-class scratchpads, not dev-server fidelity demos. Getting the folder open fast is the job; refresh is manual and acceptable.

## Consequences

- No live reload. Saving `index.html` requires a manual browser refresh.
- `@compodoc/live-server` and `lib/server.js` are gone. Install footprint drops by ~86 packages.
- `$TW_HOME` holds only `playgrounds/` — no `config.json`. Existing config files are ignored.
- ADR-0003's CDN choice stands. ADR-0004 is fully superseded.
- Users who relied on `tw dev` must use `tw open` and refresh manually, or run their own static server.
