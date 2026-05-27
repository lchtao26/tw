import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { TwError } from './errors.js';
import { addCommand } from './commands/add.js';
import { configCommand } from './commands/config.js';
import { devCommand } from './commands/dev.js';
import { listCommand } from './commands/list.js';
import { pathCommand } from './commands/path.js';
import { rmCommand } from './commands/rm.js';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8')).version;

const HELP = `tw — Tailwind CSS playground CLI

Usage:
  tw add [name]              Create a playground
  tw dev [name]              Serve a playground with HMR
  tw path [name]             Print playground path
  tw list                    List playgrounds
  tw rm [name]               Remove a playground
  tw config [key] [value]    View or set config
  tw --help, -h              Show help
  tw --version, -v           Show version

Dev flags:
  --no-open                  Do not open browser
  --no-editor                Do not open editor

Remove flags:
  -y, --yes                  Skip confirmation
`;

function parseGlobalArgs(argv) {
  if (argv.length === 0) {
    console.error(HELP.trim());
    process.exit(1);
  }

  const first = argv[0];

  if (first === '--help' || first === '-h') {
    console.log(HELP.trim());
    process.exit(0);
  }

  if (first === '--version' || first === '-v') {
    console.log(version);
    process.exit(0);
  }

  return argv;
}

function parseCommandArgs(argv) {
  const positional = [];
  const flags = {
    noOpen: false,
    noEditor: false,
    yes: false,
  };

  for (const arg of argv.slice(1)) {
    if (arg === '--no-open') {
      flags.noOpen = true;
      continue;
    }

    if (arg === '--no-editor') {
      flags.noEditor = true;
      continue;
    }

    if (arg === '-y' || arg === '--yes') {
      flags.yes = true;
      continue;
    }

    positional.push(arg);
  }

  return {
    name: positional[0],
    key: positional[0],
    value: positional[1],
    ...flags,
  };
}

export async function run(argv) {
  try {
    const args = parseGlobalArgs(argv);
    const command = args[0];
    const commandArgs = parseCommandArgs(args);

    switch (command) {
      case 'add':
        await addCommand(commandArgs);
        break;
      case 'dev':
        await devCommand(commandArgs);
        break;
      case 'path':
        await pathCommand(commandArgs);
        break;
      case 'list':
        listCommand();
        break;
      case 'rm':
        await rmCommand(commandArgs);
        break;
      case 'config':
        await configCommand(commandArgs);
        break;
      default:
        throw new TwError(`unknown command "${command}" — run tw --help`);
    }
  } catch (error) {
    if (error instanceof TwError) {
      console.error(error.message);
      process.exit(1);
    }

    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
