import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';

import {
  formatAddSuccess,
  formatDisplayPath,
  formatPlaygroundOpenCommand,
} from '../lib/messages.js';

describe('messages', () => {
  test('formatDisplayPath shortens paths under the home directory', () => {
    const home = os.homedir();
    const playground = path.join(home, '.tw', 'playgrounds', 'demo');

    assert.equal(formatDisplayPath(playground), path.join('~', '.tw', 'playgrounds', 'demo'));
  });

  test('formatDisplayPath keeps absolute paths outside the home directory', () => {
    const outside = path.parse(os.homedir()).root;

    assert.equal(formatDisplayPath(outside), outside);
  });

  test('formatPlaygroundOpenCommand quotes names with spaces', () => {
    assert.equal(formatPlaygroundOpenCommand('demo'), 'tw open demo');
    assert.equal(formatPlaygroundOpenCommand('Hover Tricks'), 'tw open "Hover Tricks"');
  });

  test('formatAddSuccess prints the friendly add summary', () => {
    const home = os.homedir();
    const root = path.join(home, '.tw', 'playgrounds', 'demo');
    const message = formatAddSuccess('demo', root);

    assert.match(message, /^Playground "demo" is ready to go\.\n\n/);
    assert.match(message, /\n  path:  ~/);
    assert.match(message, /\n  next:  tw open demo$/);
  });
});
