import { createPlayground } from '../store.js';
import { askName } from '../prompts.js';

export async function addCommand(args) {
  const name = args.name ?? (await askName());
  createPlayground(name);
  console.log(`created playground "${name}"`);
}
