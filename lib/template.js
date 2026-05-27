import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templatesRoot = path.join(packageRoot, 'templates');

export function templateRoot() {
  return templatesRoot;
}

export function materialize(name, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });

  const htmlTemplate = fs.readFileSync(path.join(templatesRoot, 'index.html'), 'utf8');
  const cssTemplate = fs.readFileSync(path.join(templatesRoot, 'src', 'main.css'), 'utf8');

  fs.writeFileSync(
    path.join(targetDir, 'index.html'),
    htmlTemplate.replaceAll('<name>', name),
    'utf8',
  );

  fs.mkdirSync(path.join(targetDir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'src', 'main.css'), cssTemplate, 'utf8');
}
