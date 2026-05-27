# tw

A tiny CLI for Tailwind CSS playgrounds. Create a named scratchpad, run `tw dev`, edit HTML/CSS, see changes instantly.

Requires **Node.js 20+**.

## Quick start

```bash
git clone https://github.com/lchtao26/tw.git
cd tw
npm install
npm link
```

Create a playground and start the dev server:

```bash
tw add demo
tw dev demo
```

Edit these two files while the server runs:

- `~/.tw/playgrounds/demo/index.html` — markup and Tailwind classes
- `~/.tw/playgrounds/demo/src/main.css` — `@import "tailwindcss"` and optional `@theme` overrides

Open the playground folder in your editor:

```bash
cursor $(tw path demo)    # or: code, subl, etc.
```

## Commands

| Command | What it does |
|---|---|
| `tw add [name]` | Create a playground. Prompts for a name if omitted. |
| `tw dev [name]` | Serve a playground with live reload. Opens a picker if omitted. |
| `tw list` | List all playgrounds. |
| `tw path [name]` | Print the absolute path to a playground. |
| `tw rm [name]` | Delete a playground. Prompts to confirm. |
| `tw config` | Configure defaults (see below). |

**Dev flags**

- `--no-open` — don't open the browser
- `--no-editor` — don't launch an editor (when configured)

**Remove flags**

- `-y` — skip the delete confirmation

## Config

Optional. Run `tw config` to set defaults interactively, or set values directly:

```bash
tw config openBrowserOnDev false
tw config openEditorOnDev cursor
```

| Key | Default | Meaning |
|---|---|---|
| `openBrowserOnDev` | `true` | Open the browser when you run `tw dev` |
| `openEditorOnDev` | `null` | Shell command to open the playground folder (e.g. `cursor`, `code`) |

Config lives at `~/.tw/config.json`. The file is created only after you change something.

Override config for a single run:

```bash
tw dev demo --no-open --no-editor
```

## Where things live

```
~/.tw/
├── config.json
└── playgrounds/
    └── demo/
        ├── index.html
        └── src/
            └── main.css
```

Playgrounds are stored globally for your user, not inside whatever project directory you happen to be in. Override the location with `$TW_HOME` if needed.

## Playground names

Use lowercase slugs: letters, numbers, and hyphens. Examples: `demo`, `hover-tricks`, `grid-lab`.

Invalid names are rejected — nothing is auto-renamed for you.

## Notes

- Playgrounds need `tw dev` running. Opening `index.html` directly in a browser won't work — Tailwind is compiled by Vite, not loaded from a CDN script.
- `tw dev` with no playgrounds yet prints: `no playgrounds yet — try: tw add <name>`
