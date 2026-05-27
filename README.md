# tw

A tiny CLI for Tailwind CSS playgrounds. Create a named scratchpad, run `tw dev`, edit HTML, see changes on save.

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

Edit this file while the server runs:

- `~/.tw/playgrounds/demo/index.html` — markup and Tailwind utility classes

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
        └── index.html
```

Playgrounds are stored globally for your user, not inside whatever project directory you happen to be in. Override the location with `$TW_HOME` if needed.

## Playground names

Use any readable label: spaces, mixed case, and unicode are fine. Examples: `demo`, `Hover Tricks`, `网格实验`.

These are rejected:

- empty names (including whitespace-only)
- `.` and `..`
- path separators (`/` `\`) and Windows-forbidden characters (`< > : " | ? *`)
- control characters
- reserved Windows device names (`CON`, `NUL`, `COM1`, …)

Names are trimmed and stored as-is — nothing is auto-renamed. Use quotes when a name contains spaces: `tw add "Hover Tricks"`.

## Notes

- Playgrounds work standalone: open `index.html` directly in a browser (`file://`) and Tailwind loads from the CDN script in the file. `tw dev` adds auto-reload on save during iteration.
- `tw dev` with no playgrounds yet prints: `no playgrounds yet — try: tw add <name>`
