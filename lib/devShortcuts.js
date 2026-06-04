import readline from 'node:readline';

import { TwError } from './errors.js';
import { formatDevOpened, formatDevRevealed, formatDevShortcutsList } from './messages.js';
import { openInBrowser, revealInFolder } from './opener.js';

export function printDevShortcuts() {
  if (!process.stdin.isTTY) {
    return;
  }

  console.log(formatDevShortcutsList());
}

export function attachDevShortcuts({ url, folder }) {
  if (!process.stdin.isTTY) {
    return () => {};
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  const onKeypress = async (_str, key) => {
    if (!key || (key.ctrl && key.name === 'c')) {
      return;
    }

    try {
      if (key.sequence === 'o') {
        await openInBrowser(url);
        console.log(formatDevOpened(url));
        return;
      }

      if (key.sequence === 'O') {
        await revealInFolder(folder);
        console.log(formatDevRevealed(folder));
      }
    } catch (error) {
      console.error(error instanceof TwError ? error.message : String(error));
    }
  };

  process.stdin.on('keypress', onKeypress);

  return () => {
    process.stdin.off('keypress', onKeypress);
    process.stdin.setRawMode(false);
    process.stdin.pause();
  };
}
