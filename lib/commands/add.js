import { formatAddSuccess } from '../messages.js';
import { askName } from '../prompts.js';
import { createPlayground, playgroundPath, validateName } from '../store.js';

export async function addCommand(args) {
  const name = args.name ?? (await askName());
  const normalized = validateName(name);
  createPlayground(name);
  console.log(formatAddSuccess(normalized, playgroundPath(normalized)));
}
