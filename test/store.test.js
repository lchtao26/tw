import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { TwError } from '../lib/errors.js';
import {
  createPlayground,
  listPlaygrounds,
  playgroundExists,
  playgroundPath,
  removePlayground,
  storePath,
  twHome,
  validateName,
} from '../lib/store.js';

describe('store', () => {
  let tempHome;
  let originalTwHome;

  beforeEach(() => {
    originalTwHome = process.env.TW_HOME;
    tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'tw-store-test-'));
    process.env.TW_HOME = tempHome;
  });

  afterEach(() => {
    if (tempHome && fs.existsSync(tempHome)) {
      fs.rmSync(tempHome, { recursive: true, force: true });
    }

    if (originalTwHome === undefined) {
      delete process.env.TW_HOME;
    } else {
      process.env.TW_HOME = originalTwHome;
    }
  });

  test('uses TW_HOME override', () => {
    assert.equal(twHome(), tempHome);
    assert.equal(storePath(), path.join(tempHome, 'playgrounds'));
  });

  test('validateName accepts filesystem-safe labels', () => {
    assert.equal(validateName('demo'), 'demo');
    assert.equal(validateName('Hover Tricks'), 'Hover Tricks');
    assert.equal(validateName('  demo  '), 'demo');
    assert.equal(validateName('demo (v2)'), 'demo (v2)');
    assert.equal(validateName('网格实验'), '网格实验');
  });

  test('validateName rejects unsafe names with specific errors', () => {
    assert.throws(() => validateName(''), /required/u);
    assert.throws(() => validateName('   '), /required/u);
    assert.throws(() => validateName('.'), /cannot be "." or ".."/u);
    assert.throws(() => validateName('..'), /cannot be "." or ".."/u);
    assert.throws(() => validateName('foo/bar'), /cannot contain "\/"/u);
    assert.throws(() => validateName('demo:v2'), /cannot contain ":"/u);
    assert.throws(() => validateName('CON'), /reserved/u);
    assert.throws(() => validateName('name\u0007bad'), /control characters/u);
  });

  test('listPlaygrounds returns sorted names and empty list when store missing', () => {
    assert.deepEqual(listPlaygrounds(), []);

    createPlayground('zebra');
    createPlayground('alpha');

    assert.deepEqual(listPlaygrounds(), ['alpha', 'zebra']);
  });

  test('createPlayground creates files and rejects duplicates', () => {
    createPlayground('demo');

    assert.equal(playgroundExists('demo'), true);
    assert.equal(
      fs.existsSync(path.join(playgroundPath('demo'), 'index.html')),
      true,
    );
    assert.equal(
      fs.existsSync(path.join(playgroundPath('demo'), 'src', 'main.css')),
      true,
    );

    assert.throws(() => createPlayground('  demo  '), TwError);
  });

  test('createPlayground accepts names with spaces', () => {
    createPlayground('Hover Tricks');
    assert.equal(playgroundExists('Hover Tricks'), true);
  });

  test('createPlayground rejects invalid names', () => {
    assert.throws(() => createPlayground('foo/bar'), TwError);
  });

  test('removePlayground deletes an existing playground', () => {
    createPlayground('demo');
    removePlayground('demo');
    assert.equal(playgroundExists('demo'), false);
  });

  test('removePlayground rejects missing playgrounds', () => {
    assert.throws(() => removePlayground('missing'), TwError);
  });
});
