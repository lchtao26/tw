import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, test } from 'node:test';

import { materialize } from '../lib/template.js';

const fixtureRoot = path.resolve('test/fixtures/demo-playground');

describe('template', () => {
  let tempDir;

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('materialize produces expected index.html with placeholder substitution', () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tw-template-test-'));
    materialize('demo', tempDir);

    const expectedHtml = fs.readFileSync(
      path.join(fixtureRoot, 'index.html'),
      'utf8',
    );
    const actualHtml = fs.readFileSync(
      path.join(tempDir, 'index.html'),
      'utf8',
    );

    assert.equal(actualHtml, expectedHtml);

    const expectedCss = fs.readFileSync(
      path.join(fixtureRoot, 'src', 'main.css'),
      'utf8',
    );
    const actualCss = fs.readFileSync(
      path.join(tempDir, 'src', 'main.css'),
      'utf8',
    );

    assert.equal(actualCss, expectedCss);
  });
});
