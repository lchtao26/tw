import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import readline from 'node:readline';
import { test } from 'node:test';

function createFakeStdin() {
  const stdin = new EventEmitter();
  stdin.isTTY = true;
  stdin.isRaw = false;
  stdin.isPaused = false;

  stdin.setRawMode = (mode) => {
    stdin.isRaw = mode;
  };

  stdin.resume = () => {
    stdin.isPaused = false;
  };

  stdin.pause = () => {
    stdin.isPaused = true;
  };

  return stdin;
}

function finishEditorPrompt(
  stdin,
  { resumeStdin = false, reemitKeypress = false } = {},
) {
  stdin.setRawMode(false);
  const rl = readline.createInterface({ input: stdin, output: process.stdout });
  rl.close();
  stdin.setRawMode(true);

  if (resumeStdin) {
    stdin.resume();
  }

  if (reemitKeypress) {
    readline.emitKeypressEvents(stdin);
  }
}

test('readline leaves stdin paused after editor prompt', () => {
  const stdin = createFakeStdin();
  readline.emitKeypressEvents(stdin);
  stdin.setRawMode(true);
  stdin.resume();

  finishEditorPrompt(stdin);

  assert.equal(stdin.isPaused, true);
});

test('resuming stdin restores shortcut handling after editor prompt', () => {
  const stdin = createFakeStdin();
  let keypressCount = 0;

  readline.emitKeypressEvents(stdin);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.on('keypress', () => {
    keypressCount += 1;
  });

  finishEditorPrompt(stdin, { resumeStdin: true });

  assert.equal(stdin.isPaused, false);
  assert.equal(stdin.isRaw, true);
  assert.equal(keypressCount, 0);

  stdin.emit('keypress', 'o', { sequence: 'o', name: 'o' });
  assert.equal(keypressCount, 1);
});
