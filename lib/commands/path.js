import { playgroundPath } from '../store.js';
import { pickPlayground } from '../prompts.js';

export async function pathCommand(args) {
  const name = args.name ?? (await pickPlayground('Pick a playground'));
  console.log(playgroundPath(name));
}
