import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { TwError } from './errors.js';
import { materialize } from './template.js';

const NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export function twHome() {
  return process.env.TW_HOME ?? path.join(os.homedir(), '.tw');
}

export function storePath() {
  return path.join(twHome(), 'playgrounds');
}

export function validateName(name) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new TwError('playground name is required');
  }

  if (!NAME_PATTERN.test(name)) {
    throw new TwError(
      'playground name must match ^[a-z0-9][a-z0-9-]*$ (lowercase letters, numbers, hyphens)',
    );
  }
}

export function playgroundPath(name) {
  validateName(name);
  return path.join(storePath(), name);
}

export function playgroundExists(name) {
  validateName(name);
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
  validateName(name);

  if (playgroundExists(name)) {
    throw new TwError(`playground "${name}" already exists`);
  }

  ensureStore();
  materialize(name, playgroundPath(name));
}

export function removePlayground(name) {
  validateName(name);

  if (!playgroundExists(name)) {
    throw new TwError(`playground "${name}" does not exist`);
  }

  fs.rmSync(playgroundPath(name), { recursive: true, force: true });
}

export const EMPTY_STORE_MESSAGE = 'no playgrounds yet — try: tw add <name>';
