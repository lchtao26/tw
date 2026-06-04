import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';

import {
  formatAddSuccess,
  formatDevLaunched,
  formatDevNoEditorYet,
  formatDevOpened,
  formatDevRevealed,
  formatDevShortcutsList,
  formatDisplayPath,
  formatPlaygroundDevCommand,
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

  test('formatPlaygroundDevCommand quotes names with spaces', () => {
    assert.equal(formatPlaygroundDevCommand('demo'), 'tw dev demo');
    assert.equal(formatPlaygroundDevCommand('Hover Tricks'), 'tw dev "Hover Tricks"');
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
    assert.match(message, /\n  next:  tw dev demo$/);
  });

  test('formatDevShortcutsList prints the titled shortcut list', () => {
    assert.equal(
      formatDevShortcutsList(),
      [
        '',
        'Shortcuts',
        '  o  open in browser',
        '  O  reveal in folder',
        '  e  open in editor',
        '  E  open in last editor',
        '',
      ].join('\n'),
    );
  });

  test('formatDevOpened prints the served URL', () => {
    assert.equal(formatDevOpened('http://127.0.0.1:5173/'), '  → opened http://127.0.0.1:5173/');
  });

  test('formatDevRevealed shortens paths under the home directory', () => {
    const home = os.homedir();
    const root = path.join(home, '.tw', 'playgrounds', 'demo');

    assert.equal(formatDevRevealed(root), `  → revealed ${path.join('~', '.tw', 'playgrounds', 'demo')}`);
  });

  test('formatDevLaunched prints editor and shortened folder path', () => {
    const home = os.homedir();
    const root = path.join(home, '.tw', 'playgrounds', 'demo');

    assert.equal(
      formatDevLaunched('cursor', root),
      `  → launched cursor → ${path.join('~', '.tw', 'playgrounds', 'demo')}`,
    );
  });

  test('formatDevNoEditorYet prints the hint to press e first', () => {
    assert.equal(formatDevNoEditorYet(), '  → no editor yet — press e first');
  });
});
