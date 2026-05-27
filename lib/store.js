import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { TwError } from './errors.js';
import { materialize } from './template.js';

const WINDOWS_RESERVED = new Set([
  'CON',
  'PRN',
  'AUX',
  'NUL',
  'COM1',
  'COM2',
  'COM3',
  'COM4',
  'COM5',
  'COM6',
  'COM7',
  'COM8',
  'COM9',
  'LPT1',
  'LPT2',
  'LPT3',
  'LPT4',
  'LPT5',
  'LPT6',
  'LPT7',
  'LPT8',
  'LPT9',
]);

function findForbiddenCharacter(name) {
  for (const char of name) {
    const code = char.charCodeAt(0);

    if (code >= 0 && code <= 0x1f) {
      return { type: 'control' };
    }

    if (char === '/' || char === '\\' || char === '<' || char === '>' || char === ':') {
      return { type: 'char', char };
    }

    if (char === '"' || char === '|' || char === '?' || char === '*') {
      return { type: 'char', char };
    }
  }

  return null;
}

export function validateName(name) {
  if (typeof name !== 'string') {
    throw new TwError('playground name is required');
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    throw new TwError('playground name is required');
  }

  if (trimmed === '.' || trimmed === '..') {
    throw new TwError('playground name cannot be "." or ".."');
  }

  const reserved = trimmed.split('.')[0].toUpperCase();
  if (WINDOWS_RESERVED.has(reserved)) {
    throw new TwError('playground name is reserved');
  }

  const forbidden = findForbiddenCharacter(trimmed);
  if (forbidden?.type === 'control') {
    throw new TwError('playground name cannot contain control characters');
  }

  if (forbidden?.type === 'char') {
    throw new TwError(`playground name cannot contain "${forbidden.char}"`);
  }

  return trimmed;
}

export function twHome() {
  return process.env.TW_HOME ?? path.join(os.homedir(), '.tw');
}

export function storePath() {
  return path.join(twHome(), 'playgrounds');
}

export function playgroundPath(name) {
  return path.join(storePath(), validateName(name));
}

export function playgroundExists(name) {
  return fs.existsSync(playgroundPath(name));
}

export function listPlaygrounds() {
  const root = storePath();

  if (!fs.existsSync(root)) {
    return [];
  }

  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function ensureStore() {
  fs.mkdirSync(storePath(), { recursive: true });
}

export function createPlayground(name) {
  const normalized = validateName(name);

  if (playgroundExists(normalized)) {
    throw new TwError(`playground "${normalized}" already exists`);
  }

  ensureStore();
  materialize(normalized, playgroundPath(normalized));
}

export function removePlayground(name) {
  const normalized = validateName(name);

  if (!playgroundExists(normalized)) {
    throw new TwError(`playground "${normalized}" does not exist`);
  }

  fs.rmSync(playgroundPath(normalized), { recursive: true, force: true });
}

export const EMPTY_STORE_MESSAGE = 'no playgrounds yet — try: tw add <name>';
