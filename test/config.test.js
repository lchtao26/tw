import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, test } from 'node:test';

import {
  DEFAULT_CONFIG,
  formatConfigValue,
  parseConfigValue,
  readConfig,
  validateConfigKey,
  writeConfig,
} from '../lib/config.js';
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

  test('readConfig returns defaults when file is missing', () => {
    assert.deepEqual(readConfig(), DEFAULT_CONFIG);
  });

  test('readConfig merges partial file with defaults', () => {
    fs.mkdirSync(tempHome, { recursive: true });
    fs.writeFileSync(
      path.join(tempHome, 'config.json'),
      JSON.stringify({ openEditorOnDev: 'cursor' }),
      'utf8',
    );

    assert.deepEqual(readConfig(), {
      openBrowserOnDev: true,
      openEditorOnDev: 'cursor',
    });
  });

  test('writeConfig persists values lazily', () => {
    writeConfig({ openBrowserOnDev: false });

    assert.deepEqual(readConfig(), {
      openBrowserOnDev: false,
      openEditorOnDev: null,
    });
    assert.equal(fs.existsSync(path.join(tempHome, 'config.json')), true);
  });

  test('validateConfigKey rejects unknown keys', () => {
    assert.throws(() => validateConfigKey('unknown'), TwError);
  });

  test('parseConfigValue validates values per key', () => {
    assert.equal(parseConfigValue('openBrowserOnDev', 'true'), true);
    assert.equal(parseConfigValue('openBrowserOnDev', 'false'), false);
    assert.equal(parseConfigValue('openEditorOnDev', 'cursor'), 'cursor');
    assert.equal(parseConfigValue('openEditorOnDev', 'null'), null);
    assert.equal(parseConfigValue('openEditorOnDev', ''), null);

    assert.throws(() => parseConfigValue('openBrowserOnDev', 'maybe'), TwError);
  });

  test('formatConfigValue renders null and booleans', () => {
    assert.equal(formatConfigValue(null), 'null');
    assert.equal(formatConfigValue(true), 'true');
    assert.equal(formatConfigValue(false), 'false');
    assert.equal(formatConfigValue('cursor'), 'cursor');
  });
});
