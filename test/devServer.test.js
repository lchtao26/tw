import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { createServer } from 'vite';

import {
  bundledFontFilePath,
  createDevServerOptions,
} from '../lib/devServer.js';
import { materialize } from '../lib/template.js';

function fontRequestUrl(base, absolutePath) {
  const origin = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${origin}/@fs${absolutePath}`;
}

describe('devServer', () => {
  let tempDir;
  let server;

  afterEach(async () => {
    if (server) {
      await server.close();
      server = undefined;
    }

    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('createDevServerOptions allows bundled font files outside playground root', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tw-dev-server-test-'));
    materialize('fonts', tempDir);

    server = await createServer(createDevServerOptions(tempDir));
    await server.listen();

    const base = server.resolvedUrls?.local[0];
    assert.ok(base);

    const woffPath = bundledFontFilePath(
      'inter',
      'inter-latin-wght-normal.woff2',
    );
    const response = await fetch(fontRequestUrl(base, woffPath));
    const body = Buffer.from(await response.arrayBuffer());

    assert.equal(response.status, 200);
    assert.equal(body.subarray(0, 4).toString(), 'wOF2');
  });

  test('bundled font @fs URLs are blocked without server.fs.allow', async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tw-dev-server-test-'));
    materialize('fonts', tempDir);

    const options = createDevServerOptions(tempDir);
    delete options.server.fs;

    server = await createServer(options);
    await server.listen();

    const base = server.resolvedUrls?.local[0];
    assert.ok(base);

    const woffPath = bundledFontFilePath(
      'inter',
      'inter-latin-wght-normal.woff2',
    );
    const response = await fetch(fontRequestUrl(base, woffPath));

    assert.equal(response.status, 403);
  });
});
