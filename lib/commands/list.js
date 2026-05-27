import { listPlaygrounds } from '../store.js';

export function listCommand() {
  for (const name of listPlaygrounds()) {
    console.log(name);
  }
}
