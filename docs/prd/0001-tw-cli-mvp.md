# tw CLI MVP

## Problem Statement

Trying out Tailwind CSS ideas in a clean, throwaway environment requires repetitive setup: an HTML file, a CSS file with `@import "tailwindcss"`, a Vite project or live-reloading static server, and a directory to host the experiment. Each idea either accumulates inside a real project (polluting it) or gets thrown together in a forgettable `/tmp/foo`. Without a single place to gather these experiments and a single command to run them, the friction kills the playground vibe — Tailwind ideas don't get tried.

## Solution

A small CLI, `tw`, that owns a user-global library of named **playgrounds** and serves any of them on demand with a real Tailwind v4 toolchain (Vite + `@tailwindcss/vite`) under HMR.

- Create: `tw add <name>`
- Run: `tw dev <name>`
- Locate: `tw path <name>`
- Inventory: `tw list`
- Delete: `tw rm <name>`
- Configure: `tw config`

Every name-taking command, invoked without a name, opens an interactive picker over the **store**. Behavior — auto-opening a browser, auto-launching an editor — is per-user-configurable via `tw config`, with per-invocation overrides.

## User Stories

1. As a Tailwind user, I want to create a playground by name (`tw add hover-tricks`), so that I can start sketching an idea without setting up a project.
2. As a Tailwind user, I want `tw add` without a name to prompt me for one, so that I don't need to remember command shape when I'm exploring.
3. As a Tailwind user, I want a freshly created playground to be a minimum two-file shape (`index.html` + `src/main.css` with `@import "tailwindcss"`), so that I start from a clean slate with no boilerplate to delete.
4. As a Tailwind user, I want playground names validated against a strict slug (`^[a-z0-9][a-z0-9-]*$`), so that they work as filenames, URLs, and CLI args without quoting.
5. As a Tailwind user, I want `tw add` to refuse to overwrite an existing playground, so that I never accidentally lose work.
6. As a Tailwind user, I want playgrounds to live in a user-global **store** (`$TW_HOME/playgrounds/`), so that they're not tied to whatever CWD I happened to be in.
7. As a Tailwind user, I want `$TW_HOME` to be overridable via env var, so that I can isolate test runs or relocate my data.
8. As a Tailwind user, I want `tw dev <name>` to start Vite + Tailwind with HMR over the playground, so that changes appear instantly without a refresh.
9. As a Tailwind user, I want `tw dev` without a name to open a filter-as-I-type picker over my existing playgrounds, so that I can switch contexts without leaving the terminal.
10. As a Tailwind user, I want `tw dev` to print the served URL clearly, so that I can copy it to another browser or device.
11. As a Tailwind user, I want `tw dev` to auto-open my default browser, controllable on/off via `openBrowserOnDev` config, so that the most common path is one keystroke.
12. As a Tailwind user, I want `tw dev` to also launch my IDE via a CLI command (`cursor`, `code`, `subl`, …) when `openEditorOnDev` is set, so that "start playing" and "start editing" are the same action.
13. As a Tailwind user, I want per-invocation overrides (`--no-open`, `--no-editor`) on `tw dev`, so that I can override config for one run without changing it permanently.
14. As a Tailwind user, I want editor-launch to warn-not-crash if the configured binary is missing, so that a typo in config doesn't kill my dev server.
15. As a Tailwind user, I want `tw list` to print all my playgrounds (one per line, sorted), so that I can pipe it into scripts.
16. As a Tailwind user, I want `tw list` to exit 0 with no output when the store is empty, so that pipeline-style usage stays predictable.
17. As a Tailwind user, I want `tw path <name>` to print the absolute path of a playground, so that I can `cd $(tw path foo)` or `cursor $(tw path foo)` from anywhere.
18. As a Tailwind user, I want `tw path` without a name to open the same picker as `tw dev`, so that interaction is uniform across commands.
19. As a Tailwind user, I want `tw rm <name>` to delete a playground after a confirmation prompt, so that I don't fat-finger destructive operations.
20. As a Tailwind user, I want `tw rm <name> -y` to skip the confirmation, so that scripted cleanup is possible.
21. As a Tailwind user, I want `tw rm` without a name to chain picker → confirmation, so that interactive deletion is two intentional steps.
22. As a Tailwind user, I want `tw dev` / `tw path` / `tw rm` to fail with a clear "no playgrounds yet — try `tw add <name>`" message when the store is empty, so that I'm not staring at an empty picker.
23. As a Tailwind user, I want `tw config` to open an interactive prompt for each setting, so that I can adjust everything without remembering keys.
24. As a Tailwind user, I want `tw config <key>` to print the current value, so that I can quickly inspect state.
25. As a Tailwind user, I want `tw config <key> <value>` to set a value directly, so that scripts and aliases work.
26. As a Tailwind user, I want `tw config` to reject unknown keys with a list of valid ones, so that typos surface immediately.
27. As a Tailwind user, I want the config file to be created lazily (only when I set something), so that a fresh `$TW_HOME` stays minimal.
28. As a Tailwind user, I want missing config to behave as defaults (`openBrowserOnDev=true`, `openEditorOnDev=null`), so that I get a reasonable experience without configuring anything.
29. As a Tailwind user, I want Ctrl-C in any prompt to exit cleanly with code 0, so that bailing from interactive flows feels natural.
30. As a Tailwind user, I want `tw --version` / `-v` and `tw --help` / `-h` to behave conventionally, so that the CLI feels familiar.
31. As a Tailwind user, I want `tw` with no args to print help and exit non-zero, so that I can discover the command surface without reading the README.
32. As a Tailwind user encountering a problem, I want every error message to be one human-readable line, so that I don't parse stack traces for routine misuse.
33. As a Tailwind user, I want the Tailwind version to be `tw`'s concern (not per-playground), so that bumping `tw` automatically gives every playground the latest stable Tailwind.
34. As a Tailwind user, I want playground HTML to reference compiled CSS at `<link href="/src/main.css">`, so that I get Vite HMR rather than runtime CDN compilation.
35. As a maintainer of `tw`, I want the runtime dependency set to be exactly `vite`, `tailwindcss`, `@tailwindcss/vite`, `@clack/prompts`, so that maintenance cost stays bounded.
36. As a maintainer of `tw`, I want the deep modules (`store`, `config`, `template`) tested in isolation via `node --test`, so that core behaviors don't regress.

## Implementation Decisions

- **Module shape.** Five `lib/` modules — `cli`, `store`, `config`, `prompts`, `template` — plus one orchestrator per command under `lib/commands/`. The Vite + editor-spawn logic lives inline inside `commands/dev.js` (no separate `devServer` module) to keep glue close to its caller.
- **`store` module (deep).** Owns `$TW_HOME` resolution, slug validation against `^[a-z0-9][a-z0-9-]*$`, and the playground fs layout. Exposes `listPlaygrounds()`, `playgroundPath(name)`, `playgroundExists(name)`, `createPlayground(name)`, `removePlayground(name)`, `validateName(name)`. Throws structured errors for invalid name, conflict, and missing playground.
- **`config` module (deep).** Owns the JSON schema (`openBrowserOnDev: boolean`, `openEditorOnDev: string | null`), with defaults applied at read time. Exposes `readConfig()`, `writeConfig(partial)`, a `CONFIG_KEYS` whitelist, and per-key value validation. Lazily creates `$TW_HOME/config.json` only when a value is set.
- **`template` module (deep).** `materialize(name, targetDir)` produces the two-file playground from on-disk templates, substituting `<name>` into the HTML `<title>`. Deterministic input → deterministic output.
- **`prompts` module (shallow).** Wraps `@clack/prompts` — autocomplete picker over playgrounds, text input for a new name (with slug validation), confirm for `rm`, and a compound config wizard. Centralizes Ctrl-C → clean exit.
- **`cli` module.** Hand-rolled argv parsing — no `commander`/`yargs`. Dispatches to `commands/*`. Top-level error handler converts thrown errors to one-line stderr + non-zero exit.
- **Vite integration.** `commands/dev.js` calls Vite's Node API: `createServer({ root: playgroundPath, plugins: [tailwindcss()], server: { open: openBrowserOnDev } })`. Port discovery is Vite's responsibility. Editor spawn (`child_process.spawn(cmd, [path], { stdio: 'ignore', detached: true })`) — ENOENT or non-zero exit logs a warning, does not crash the server.
- **Per-invocation flags.** `--no-open` and `--no-editor` parsed by `commands/dev.js`; override config without persisting.
- **`tw config` command surface.** `tw config` (interactive wizard), `tw config <key>` (read), `tw config <key> <value>` (write). Unknown keys rejected with the list of valid ones.
- **Empty-store UX.** `tw dev` / `tw path` / `tw rm` with empty store: one-line friendly error. `tw list`: exit 0, no output.
- **Naming validation.** Applied uniformly across direct args and interactive prompts. Invalid names are rejected, never auto-slugified.
- **Distribution.** Node ESM package, `bin: tw`, `engines.node: >=20`. Plain JS, no TypeScript, no build step. Runtime deps: `vite`, `tailwindcss`, `@tailwindcss/vite`, `@clack/prompts`.

## Testing Decisions

- **Philosophy.** Tests assert observable behavior, not internal mechanics. A `store` test asserts "after `createPlayground('foo')`, `playgroundPath('foo')` exists and contains `index.html`" — never "the function called `fs.mkdirSync` with these flags."
- **Scope.** Only the three deep modules — `store`, `config`, `template` — are tested. The shallow modules (`prompts`, `commands/*`, `cli`) are explicitly excluded; their behavior is reachable through manual smoke testing.
- **Runner.** `node --test` — built-in, zero added dependencies, native parallelism and subtests.
- **Isolation.** Each test points `$TW_HOME` at a fresh `os.tmpdir()` subfolder and cleans up via `t.after`. No shared state between tests.
- **`store` coverage.** Slug validation (positive and negative cases), `listPlaygrounds()` ordering and empty case, `createPlayground` happy path + duplicate conflict + invalid name, `removePlayground` happy path + missing playground, `$TW_HOME` override.
- **`config` coverage.** Read with missing file (returns defaults), read with partial file (merges defaults), write persists across reads, unknown key rejection, per-key value validation.
- **`template` coverage.** `materialize` produces the expected two-file structure with placeholder substitution; output is byte-stable against a checked-in fixture.
- **Prior art.** Greenfield project; no prior art in-repo. Reference: Node's own `node:test` documentation and `assert` patterns.

## Out of Scope

- Multi-playground "projects" (nested playgrounds, shared assets, manifests).
- `tw build` or any export-to-static feature. Playgrounds are dev-only artifacts.
- Auto-update of templates in already-created playgrounds.
- Per-playground config files (e.g., a `.tw.json` inside a playground).
- Browser selection (`--browser=chrome`) or multi-browser open.
- Multiple editor commands or composition.
- Per-playground Tailwind version pinning.
- Cloud sync, sharing, network features.
- Tests for shallow modules; end-to-end / integration smoke tests; CI; release automation.
- README and contributor docs (separate follow-up task).
- TypeScript, linter, formatter — deferred to keep the project minimal.

## Further Notes

- ADRs `docs/adr/0001-central-user-global-store.md` and `docs/adr/0002-vite-toolchain-over-cdn.md` document the two scoping reversals (not per-project; not runtime CDN). The PRD honors them.
- `CONTEXT.md` defines the glossary. **Playground**, **Store**, **`$TW_HOME`**, and **Config** are used here exactly as defined there.
- The npm package name and the eventual folder rename (`tw-starter` → `tw`) are deliberate non-decisions in this PRD — they don't gate implementation.
