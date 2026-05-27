import { spawn } from 'node:child_process';

import tailwindcss from '@tailwindcss/vite';
import { createServer } from 'vite';

import { readConfig } from '../config.js';
import { playgroundPath } from '../store.js';
import { pickPlayground } from '../prompts.js';

function launchEditor(command, playgroundDir) {
  const child = spawn(command, [playgroundDir], {
    stdio: 'ignore',
    detached: true,
  });

  child.on('error', () => {
    console.warn(`warning: could not launch editor "${command}"`);
  });

  child.unref();
}

export async function devCommand(args) {
  const name = args.name ?? (await pickPlayground('Pick a playground to serve'));
  const config = readConfig();
  const root = playgroundPath(name);
  const openBrowser = args.noOpen ? false : config.openBrowserOnDev;
  const openEditor = args.noEditor ? null : config.openEditorOnDev;

  const server = await createServer({
    root,
    plugins: [tailwindcss()],
    server: {
      open: openBrowser,
    },
  });

  await server.listen();
  server.printUrls();

  if (openEditor) {
    launchEditor(openEditor, root);
  }

  const shutdown = async () => {
    await server.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await new Promise(() => {});
}
