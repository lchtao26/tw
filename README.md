# tw

A tiny CLI for Tailwind CSS playgrounds. Create a named scratchpad, run `tw open`, edit `index.html`, preview in your browser.

## Install

```bash
npm install -g tw
```

Requires Node.js 20+.

## Quick start

Create a playground and reveal it in your file manager:

```bash
tw add demo
tw open demo
```

Edit the HTML and open `index.html` in your browser — Tailwind loads from a CDN script in the file.

## Commands

| Command | Description |
|---------|-------------|
| `tw add [name]` | Create a playground. Prompts for a name if omitted. |
| `tw open [name]` | Reveal a playground folder in the file manager. Opens a picker if omitted. |
| `tw path [name]` | Print a playground's absolute path. Opens a picker if omitted. |
| `tw list` | List playground names. |
| `tw rm [name]` | Remove a playground. Opens a picker if omitted. |

`tw rm` flags:

- `-y`, `--yes` — skip confirmation

## Where things live

```
~/.tw/
└── playgrounds/
    └── demo/
        └── index.html
```

Override the root with `TW_HOME`:

```bash
export TW_HOME=/path/to/my-tw
```

## Playground names

Names are used as folder names under `~/.tw/playgrounds/`. They must be non-empty and filesystem-safe. These are rejected:

- `.`, `..`, names with `/` or `\`
- reserved Windows device names (`CON`, `NUL`, `COM1`, …)

Names with spaces are allowed — quote them on the shell: `tw open "Hover Tricks"`.

## Notes

- Playgrounds work standalone: open `index.html` directly in a browser (`file://`) and Tailwind loads from the CDN script in the file.
- `tw open` with no playgrounds yet prints: `no playgrounds yet — try: tw add <name>`
