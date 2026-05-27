import { autocomplete, confirm, isCancel, text } from '@clack/prompts';

import {
  CONFIG_KEYS,
  readConfig,
  writeConfig,
} from './config.js';
import { TwError } from './errors.js';
import { EMPTY_STORE_MESSAGE, listPlaygrounds, validateName } from './store.js';

export function exitOnCancel(value) {
  if (isCancel(value)) {
    process.exit(0);
  }

  return value;
}

export async function pickPlayground(message) {
  const playgrounds = listPlaygrounds();

  if (playgrounds.length === 0) {
    throw new TwError(EMPTY_STORE_MESSAGE);
  }

  const selected = exitOnCancel(
    await autocomplete({
      message,
      options: playgrounds.map((name) => ({ value: name, label: name })),
      placeholder: 'Type to filter…',
    }),
  );

  return selected;
}

export async function askName() {
  const name = exitOnCancel(
    await text({
      message: 'Playground name',
      validate(value) {
        if (!value) {
          return 'playground name is required';
        }

        try {
          validateName(value);
        } catch (error) {
          return error.message;
        }
      },
    }),
  );

  return name;
}

export async function confirmRemove(name) {
  const confirmed = exitOnCancel(
    await confirm({
      message: `Delete playground "${name}"? This cannot be undone.`,
    }),
  );

  return confirmed;
}

export async function configWizard() {
  const current = readConfig();
  const next = { ...current };

  for (const key of CONFIG_KEYS) {
    if (key === 'openBrowserOnDev') {
      const value = exitOnCancel(
        await confirm({
          message: 'Open browser on dev?',
          initialValue: current.openBrowserOnDev,
        }),
      );

      next.openBrowserOnDev = value;
      continue;
    }

    const value = exitOnCancel(
      await text({
        message: 'Open editor on dev (leave empty to disable)',
        initialValue: current.openEditorOnDev ?? '',
        placeholder: 'cursor, code, subl…',
      }),
    );

    next.openEditorOnDev = value === '' ? null : value;
  }

  writeConfig(next);
}
