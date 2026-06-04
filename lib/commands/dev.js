import { createRequire } from 'node:module';
import path from 'node:path';

import { createServer } from 'vite';
import tailwindcss from '@tailwindcss/vite';

import { attachDevShortcuts, printDevShortcuts } from '../devShortcuts.js';
import { pickPlayground } from '../prompts.js';
import { playgroundPath } from '../store.js';

const require = createRequire(import.meta.url);

// Playgrounds live in the store and have no node_modules of their own, so
// `@import "tailwindcss"` can't resolve from the playground root. Point Vite at
// tw's bundled copy instead — tw owns the Tailwind version (see ADR-0006).
const tailwindEntry = require.resolve('tailwindcss/index.css');
const tailwindDir = path.dirname(require.resolve('tailwindcss/package.json'));

export async function devCommand(args) {
  const name = args.name ?? (await pickPlayground('Pick a playground to dev'));
  const root = playgroundPath(name);

  const server = await createServer({
    root,
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        { find: /^tailwindcss$/, replacement: tailwindEntry },
        { find: /^tailwindcss\//, replacement: `${tailwindDir}/` },
      ],
    },
    server: {
      host: '127.0.0.1',
      open: false,
    },
  });

  await server.listen();
  server.printUrls();

  const url = server.resolvedUrls?.local[0];
  if (!url) {
    throw new Error('dev server did not resolve a local URL');
  }

  printDevShortcuts();

  await new Promise((resolve) => {
    let shuttingDown = false;

    const shutdown = async () => {
      if (shuttingDown) {
        return;
      }

      shuttingDown = true;
      detachShortcuts();
      await server.close();
      resolve();
    };

    const detachShortcuts = attachDevShortcuts({ url, folder: root, onExit: shutdown });

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  });
}
