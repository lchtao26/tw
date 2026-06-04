import { spawn } from 'node:child_process';
import path from 'node:path';

import { TwError } from './errors.js';

function spawnDetached(command, args, errorMessage) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'ignore',
      detached: true,
    });

    child.on('error', () => {
      reject(new TwError(errorMessage));
    });

    child.unref();
    resolve();
  });
}

export function revealInFolder(dir) {
  const absoluteDir = path.resolve(dir);
  const platform = process.platform;

  if (platform === 'darwin') {
    return spawnDetached(
      'open',
      [absoluteDir],
      `could not reveal folder: ${absoluteDir}`,
    );
  }

  if (platform === 'win32') {
    return spawnDetached(
      'explorer',
      [absoluteDir],
      `could not reveal folder: ${absoluteDir}`,
    );
  }

  return spawnDetached(
    'xdg-open',
    [absoluteDir],
    `could not reveal folder: ${absoluteDir}`,
  );
}

export function openInBrowser(url) {
  const platform = process.platform;

  if (platform === 'darwin') {
    return spawnDetached('open', [url], `could not open browser: ${url}`);
  }

  if (platform === 'win32') {
    return spawnDetached(
      'cmd',
      ['/c', 'start', '""', url],
      `could not open browser: ${url}`,
    );
  }

  return spawnDetached('xdg-open', [url], `could not open browser: ${url}`);
}

export function launchEditor(commandLine, dir) {
  const trimmed = commandLine.trim();
  const parts = trimmed.split(/\s+/);
  const command = parts[0];
  const args = [...parts.slice(1), path.resolve(dir)];

  return spawnDetached(command, args, `could not launch ${command}`);
}
