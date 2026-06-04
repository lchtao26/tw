import fs from 'node:fs';
import path from 'node:path';

import { TwError } from './errors.js';
import { twHome } from './store.js';

export function configPath() {
  return path.join(twHome(), 'config.json');
}

export function readConfig() {
  const filePath = configPath();

  if (!fs.existsSync(filePath)) {
    return { editor: null };
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const editor = typeof data.editor === 'string' ? data.editor.trim() : '';

    return { editor: editor || null };
  } catch {
    return { editor: null };
  }
}

export function writeEditor(editor) {
  const trimmed = editor.trim();

  if (!trimmed) {
    throw new TwError('editor is required');
  }

  const filePath = configPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    `${JSON.stringify({ editor: trimmed }, null, 2)}\n`,
    'utf8',
  );

  return trimmed;
}
