import { createServer } from 'vite';

import { createDevServerOptions } from '../devServer.js';
import { attachDevShortcuts, printDevShortcuts } from '../devShortcuts.js';
import { pickPlayground } from '../prompts.js';
import { playgroundPath } from '../store.js';

export async function devCommand(args) {
  const name = args.name ?? (await pickPlayground('Pick a playground to dev'));
  const root = playgroundPath(name);

  const server = await createServer(createDevServerOptions(root));

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

    const detachShortcuts = attachDevShortcuts({
      url,
      folder: root,
      onExit: shutdown,
    });

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  });
}
