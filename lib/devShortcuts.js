import readline from 'node:readline';

import { readConfig, writeEditor } from './config.js';
import { TwError } from './errors.js';
import {
  formatDevLaunched,
  formatDevNoEditorYet,
  formatDevOpened,
  formatDevRevealed,
  formatDevShortcutsList,
} from './messages.js';
import { launchEditor, openInBrowser, revealInFolder } from './opener.js';

function askEditorCommand() {
  return new Promise((resolve) => {
    process.stdin.setRawMode(false);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const finish = (value) => {
      rl.close();
      process.stdin.setRawMode(true);
      resolve(value);
    };

    rl.on('SIGINT', () => {
      finish('');
    });

    rl.question('Editor: ', (answer) => {
      finish(answer.trim());
    });
  });
}

export function printDevShortcuts() {
  if (!process.stdin.isTTY) {
    return;
  }

  console.log(formatDevShortcutsList());
}

export function attachDevShortcuts({ url, folder, onExit }) {
  if (!process.stdin.isTTY) {
    return () => {};
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  let busy = false;

  const onKeypress = async (_str, key) => {
    if (!key) {
      return;
    }

    if (key.ctrl && key.name === 'c') {
      onExit();
      return;
    }

    if (busy) {
      return;
    }

    try {
      busy = true;

      if (key.sequence === 'o') {
        await openInBrowser(url);
        console.log(formatDevOpened(url));
        return;
      }

      if (key.sequence === 'O') {
        await revealInFolder(folder);
        console.log(formatDevRevealed(folder));
        return;
      }

      if (key.sequence === 'e') {
        const editor = await askEditorCommand();
        if (!editor) {
          return;
        }

        writeEditor(editor);
        await launchEditor(editor, folder);
        console.log(formatDevLaunched(editor, folder));
        return;
      }

      if (key.sequence === 'E') {
        const { editor } = readConfig();
        if (!editor) {
          console.log(formatDevNoEditorYet());
          return;
        }

        await launchEditor(editor, folder);
        console.log(formatDevLaunched(editor, folder));
      }
    } catch (error) {
      console.error(error instanceof TwError ? error.message : String(error));
    } finally {
      busy = false;
    }
  };

  process.stdin.on('keypress', onKeypress);

  return () => {
    process.stdin.off('keypress', onKeypress);
    process.stdin.setRawMode(false);
    process.stdin.pause();
  };
}
