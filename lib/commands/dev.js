import { spawn } from 'node:child_process';

import { readConfig } from '../config.js';
import { pickPlayground } from '../prompts.js';
import { startServer } from '../server.js';
import { playgroundPath } from '../store.js';

function openInBrowser(url) {
  const platform = process.platform;
  let command;
  let args;

  if (platform === 'darwin') {
    command = 'open';
    args = [url];
  } else if (platform === 'win32') {
    command = 'cmd';
    args = ['/c', 'start', '', url];
  } else {
    command = 'xdg-open';
    args = [url];
  }

  const child = spawn(command, args, {
    stdio: 'ignore',
    detached: true,
  });

  child.on('error', () => {
    console.warn(`warning: could not open browser for ${url}`);
  });

  child.unref();
}

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

  const server = await startServer({ root });

  console.log(`  ➜  Local:   ${server.url}`);

  if (openBrowser) {
    openInBrowser(server.url);
  }

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
