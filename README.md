# tw

A tiny CLI for Tailwind CSS playgrounds — named scratchpads in a user-global store.

## Install

```bash
git clone https://github.com/lchtao26/tw.git
cd tw
npm install
npm link
```

This installs dependencies and links the `tw` CLI on your PATH. The package is not published to npm.

## Quick start

Create a playground and start the dev server:

```bash
tw add demo
tw dev demo
```

Open the URL printed in your terminal. Edit `index.html` or `src/main.css` — changes hot-reload via Vite.

Playgrounds live in `~/.tw/playgrounds/<name>/`. Set `TW_HOME` to override.

## Commands

| Command | Description |
|---------|-------------|
| `tw add [name]` | Create a playground. Prompts for a name if omitted. |
| `tw dev [name]` | Start Vite + Tailwind HMR for a playground. Prompts if omitted. |
| `tw open [name]` | Reveal a playground folder in the file manager. Opens a picker if omitted. |
| `tw path [name]` | Print a playground's absolute path. Opens a picker if omitted. |
| `tw list` | List playground names. |
| `tw rm [name]` | Remove a playground. Opens a picker if omitted. |
