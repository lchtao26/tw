# Inter Variable bundled via `@fontsource-variable`, resolved in **Dev**

ADR-0006 keeps playgrounds dependency-free: Tailwind compiles through `tw`'s Vite toolchain, with `@import "tailwindcss"` aliased to `tw`'s `node_modules`. System-ui sans is the default typography experience unless the user wires a font themselves.

We extend that pattern to web fonts. New playgrounds ship `@import '@fontsource-variable/inter'` and `@import '@fontsource-variable/lexend'`, with `@theme` overrides for `--font-sans: "Inter Variable"` and `--font-display: "Lexend Variable"`. Both packages are `tw` dependencies — not installed per playground. **Dev** aliases `@fontsource-variable/*` to `tw`'s `@fontsource-variable` scope so imports resolve the same way Tailwind does. Static `@fontsource/*` packages are out of scope. Existing playgrounds are not backfilled; only new `tw add` output picks up bundled fonts.

## Consequences

- `tw`'s install grows slightly (`@fontsource-variable/inter`, `@fontsource-variable/lexend`). Playgrounds stay two-file and depless.
- Swapping to another variable face in `main.css` works only when that package is also shipped with `tw`.
- **Dev** must allow `@fontsource-variable/*` on `server.fs.allow` — font CSS resolves to woff2 files under `tw`'s `node_modules` via `@fs` URLs outside the playground root.
- Users who want the old minimal CSS can delete the import and `@theme` block, or recreate the playground.
