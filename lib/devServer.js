import { createRequire } from 'node:module';
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';

const require = createRequire(import.meta.url);

// Playgrounds live in the store and have no node_modules of their own, so
// `@import "tailwindcss"` can't resolve from the playground root. Point Vite at
// tw's bundled copy instead — tw owns the Tailwind version (see ADR-0006).
const tailwindEntry = require.resolve('tailwindcss/index.css');
const tailwindDir = path.dirname(require.resolve('tailwindcss/package.json'));

// Same depless pattern for bundled variable fonts (see ADR-0007).
const fontsourceVariableScope = path.join(
  path.dirname(require.resolve('@fontsource-variable/inter/package.json')),
  '..',
);

// Same depless pattern for Iconify plugin + catalogue (see ADR-0008).
const iconifyTailwindPlugin = require.resolve('@iconify/tailwind4');
const iconifyJsonDir = path.dirname(
  require.resolve('@iconify/json/package.json'),
);

export function createDevServerOptions(root) {
  return {
    root,
    plugins: [tailwindcss()],
    resolve: {
      alias: [
        { find: /^tailwindcss$/, replacement: tailwindEntry },
        { find: /^tailwindcss\//, replacement: `${tailwindDir}/` },
        {
          find: /^@fontsource-variable\//,
          replacement: `${fontsourceVariableScope}/`,
        },
        { find: '@iconify/tailwind4', replacement: iconifyTailwindPlugin },
        { find: /^@iconify\/json/, replacement: iconifyJsonDir },
      ],
    },
    server: {
      host: '127.0.0.1',
      open: false,
      // Font CSS resolves to woff2 files under tw's node_modules via @fs URLs.
      // Playground root alone is outside that tree (see ADR-0007).
      fs: {
        allow: [root, fontsourceVariableScope, iconifyJsonDir],
      },
    },
  };
}

export function bundledFontFilePath(packageName, fileName) {
  return path.join(fontsourceVariableScope, packageName, 'files', fileName);
}
