import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';

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
import { TwError } from '../lib/errors.js';

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

  test('validateName accepts valid slugs', () => {
    assert.doesNotThrow(() => validateName('demo'));
    assert.doesNotThrow(() => validateName('hover-tricks'));
    assert.doesNotThrow(() => validateName('a1'));
  });

  test('validateName rejects invalid slugs', () => {
    assert.throws(() => validateName(''), TwError);
    assert.throws(() => validateName('Demo'), TwError);
    assert.throws(() => validateName('-demo'), TwError);
    assert.throws(() => validateName('demo_tricks'), TwError);
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
    assert.equal(fs.existsSync(path.join(playgroundPath('demo'), 'index.html')), true);
    assert.equal(fs.existsSync(path.join(playgroundPath('demo'), 'src', 'main.css')), true);

    assert.throws(() => createPlayground('demo'), TwError);
  });

  test('createPlayground rejects invalid names', () => {
    assert.throws(() => createPlayground('Bad Name'), TwError);
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
