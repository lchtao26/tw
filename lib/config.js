import fs from 'node:fs';
import path from 'node:path';

import { TwError } from './errors.js';
import { twHome } from './store.js';

export const CONFIG_KEYS = ['openBrowserOnDev', 'openEditorOnDev'];

export const DEFAULT_CONFIG = {
  openBrowserOnDev: true,
  openEditorOnDev: null,
};

export function configPath() {
  return path.join(twHome(), 'config.json');
}

export function isConfigKey(key) {
  return CONFIG_KEYS.includes(key);
}

export function formatConfigValue(value) {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value);
}

export function parseConfigValue(key, rawValue) {
  if (key === 'openBrowserOnDev') {
    if (rawValue === 'true') {
      return true;
    }

    if (rawValue === 'false') {
      return false;
    }

    throw new TwError('openBrowserOnDev must be true or false');
  }

  if (key === 'openEditorOnDev') {
    if (rawValue === 'null' || rawValue === '') {
      return null;
    }

    return rawValue;
  }

  throw new TwError(`unknown config key: ${key}`);
}

export function validateConfigKey(key) {
  if (!isConfigKey(key)) {
    throw new TwError(`unknown config key "${key}" — valid keys: ${CONFIG_KEYS.join(', ')}`);
  }
}

export function readConfig() {
  const filePath = configPath();

  if (!fs.existsSync(filePath)) {
    return { ...DEFAULT_CONFIG };
  }

  let parsed;

  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    throw new TwError('config file is invalid JSON');
  }

  return {
    ...DEFAULT_CONFIG,
    ...parsed,
  };
}

export function writeConfig(partial) {
  for (const key of Object.keys(partial)) {
    validateConfigKey(key);
  }

  const next = {
    ...readConfig(),
    ...partial,
  };

  fs.mkdirSync(twHome(), { recursive: true });
  fs.writeFileSync(configPath(), `${JSON.stringify(next, null, 2)}\n`, 'utf8');

  return next;
}
