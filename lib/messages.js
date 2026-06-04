import os from 'node:os';
import path from 'node:path';

export function formatDisplayPath(absolutePath) {
  const home = os.homedir();
  const relative = path.relative(home, absolutePath);

  if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
    return path.join('~', relative);
  }

  return absolutePath;
}

export function formatPlaygroundDevCommand(name) {
  const arg = needsShellQuoting(name) ? `"${name}"` : name;
  return `tw dev ${arg}`;
}

export function formatPlaygroundOpenCommand(name) {
  const arg = needsShellQuoting(name) ? `"${name}"` : name;
  return `tw open ${arg}`;
}

function needsShellQuoting(name) {
  return /\s/.test(name);
}

export function formatAddSuccess(name, rootPath) {
  return [
    `Playground "${name}" is ready to go.`,
    '',
    `  path:  ${formatDisplayPath(rootPath)}`,
    `  next:  ${formatPlaygroundDevCommand(name)}`,
  ].join('\n');
}

export function formatDevShortcutsList() {
  return [
    '',
    'Shortcuts',
    '  o  open in browser',
    '  O  reveal in folder',
  ].join('\n');
}

export function formatDevOpened(url) {
  return `  → opened ${url}`;
}

export function formatDevRevealed(folderPath) {
  return `  → revealed ${formatDisplayPath(folderPath)}`;
}
