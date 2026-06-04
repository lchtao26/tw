import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { configPath, readConfig, writeEditor } from '../lib/config.js';
import { TwError } from '../lib/errors.js';

describe('config', () => {
  let tempHome;
  let originalTwHome;

  beforeEach(() => {
    originalTwHome = process.env.TW_HOME;
    tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'tw-config-test-'));
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

  test('readConfig returns null editor when config is missing', () => {
    assert.equal(readConfig().editor, null);
  });

  test('writeEditor creates config.json lazily', () => {
    writeEditor('cursor');

    assert.equal(fs.existsSync(configPath()), true);
    assert.equal(readConfig().editor, 'cursor');
  });

  test('writeEditor overwrites an existing editor', () => {
    writeEditor('cursor');
    writeEditor('code');

    assert.equal(readConfig().editor, 'code');
  });

  test('writeEditor rejects empty values', () => {
    assert.throws(() => writeEditor('   '), TwError);
  });

  test('readConfig treats invalid config as no editor', () => {
    fs.mkdirSync(tempHome, { recursive: true });
    fs.writeFileSync(configPath(), '{not json', 'utf8');

    assert.equal(readConfig().editor, null);
  });
});
