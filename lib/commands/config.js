import {
  formatConfigValue,
  parseConfigValue,
  readConfig,
  validateConfigKey,
  writeConfig,
} from '../config.js';
import { configWizard } from '../prompts.js';

export async function configCommand(args) {
  if (!args.key) {
    await configWizard();
    return;
  }

  validateConfigKey(args.key);

  if (args.value === undefined) {
    const config = readConfig();
    console.log(formatConfigValue(config[args.key]));
    return;
  }

  const parsed = parseConfigValue(args.key, args.value);
  writeConfig({ [args.key]: parsed });
  console.log(`${args.key} set to ${formatConfigValue(parsed)}`);
}
