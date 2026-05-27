import path from 'node:path';

import liveServer from '@compodoc/live-server';

export async function startServer({ root, port = 0 }) {
  const absoluteRoot = path.resolve(root);

  const httpServer = liveServer.start({
    root: absoluteRoot,
    port,
    host: '0.0.0.0',
    open: false,
    logLevel: 0,
    wait: 50,
    ignore: /(^|[\/\\])\..+/,
  });

  await new Promise((resolve, reject) => {
    httpServer.once('listening', resolve);
    httpServer.once('error', reject);
  });

  const address = httpServer.address();

  if (!address || typeof address === 'string') {
    throw new Error('failed to resolve server address');
  }

  const url = `http://127.0.0.1:${address.port}/`;

  const close = async () => {
    liveServer.shutdown();
  };

  return { url, close };
}
