# Full Iconify catalogue via `@iconify/tailwind4` + `@iconify/json`, resolved in **Dev**

ADR-0007 bundles variable fonts so playgrounds stay dependency-free while `src/main.css` can `@import` faces from `tw`'s `node_modules`. Playgrounds are for quick HTML + Tailwind doodling; copying icon snippets from Iconify should work without per-playground installs.

We bundle **Iconify for Tailwind 4** and the **full open-source icon catalogue**:

- `@iconify/tailwind4` — Tailwind plugin enabled in new playgrounds via `@plugin "@iconify/tailwind4";`
- `@iconify/json` — all Iconify prefixes (~275k icons) so any `icon-[{prefix}--{name}]` class pasted from Iconify resolves

**Authoring default:** **dynamic icon classes** only (`icon-[lucide--hand]` on a host element). Clean selectors (`lucide--hand` + `iconify`) need a fixed `prefixes` list and are not part of the default template. Only icons present in HTML get CSS; the full JSON is catalogue breadth, not per-playground CSS weight.

New playgrounds ship the plugin line in `src/main.css` and a plain Hello-world line in `index.html` with one demo icon. **Dev** aliases `@iconify/tailwind4` and `@iconify/json` to `tw`'s dependencies (same resolver pattern as `tailwindcss` and `@fontsource-variable/*`). Existing playgrounds are not backfilled.

## Consequences

- `tw`'s install grows substantially (`@iconify/json` is large). First **Dev** compile after adding icon classes may be slower than utility-only scratchpads.
- Any Iconify prefix works out of the box; we did not ship a curated subset (Lucide-only, etc.) to avoid "works on the site, fails in the playground" friction.
- Users who do not want icons can delete the `@plugin` line and stop using `icon-[…]` classes.
- Shrinking the catalogue later (dropping `@iconify/json` for named `@iconify-json/*` packages) is a breaking change for playgrounds that relied on obscure prefixes.
