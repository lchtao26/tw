import { removePlayground } from '../store.js';
import { confirmRemove, pickPlayground } from '../prompts.js';

export async function rmCommand(args) {
  const name = args.name ?? (await pickPlayground('Pick a playground to delete'));

  if (!args.yes) {
    const confirmed = await confirmRemove(name);

    if (!confirmed) {
      process.exit(0);
    }
  }

  removePlayground(name);
  console.log(`removed playground "${name}"`);
}
