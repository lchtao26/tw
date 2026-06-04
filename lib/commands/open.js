import { pickPlayground } from '../prompts.js';
import { revealInFolder } from '../opener.js';
import { playgroundPath } from '../store.js';

export async function openCommand(args) {
  const name = args.name ?? (await pickPlayground('Pick a playground to open'));
  await revealInFolder(playgroundPath(name));
}
