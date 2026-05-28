import { autocomplete, confirm, isCancel, text } from '@clack/prompts';

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
