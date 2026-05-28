import { spawn } from 'node:child_process';
import path from 'node:path';

import { TwError } from '../errors.js';
import { pickPlayground } from '../prompts.js';
import { playgroundPath } from '../store.js';

function revealInFolder(dir) {
  const absoluteDir = path.resolve(dir);
  const platform = process.platform;
  let command;
  let args;

  if (platform === 'darwin') {
    command = 'open';
    args = [absoluteDir];
  } else if (platform === 'win32') {
    command = 'explorer';
    args = [absoluteDir];
  } else {
    command = 'xdg-open';
    args = [absoluteDir];
  }

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'ignore',
      detached: true,
    });

    child.on('error', () => {
      reject(new TwError(`could not reveal folder: ${absoluteDir}`));
    });

    child.unref();
    resolve();
  });
}

export async function openCommand(args) {
  const name = args.name ?? (await pickPlayground('Pick a playground to open'));
  await revealInFolder(playgroundPath(name));
}
