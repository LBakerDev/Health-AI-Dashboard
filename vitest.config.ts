import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^lucide-react\/dist\/esm\/icons\/.+\.js$/,
        replacement: fileURLToPath(new URL('./src/test/lucide-icon-stub.tsx', import.meta.url)),
      },
      { find: '@app', replacement: fileURLToPath(new URL('./src/app', import.meta.url)) },
      { find: '@data', replacement: fileURLToPath(new URL('./src/data', import.meta.url)) },
      {
        find: '@entities',
        replacement: fileURLToPath(new URL('./src/entities', import.meta.url)),
      },
      {
        find: '@features',
        replacement: fileURLToPath(new URL('./src/features', import.meta.url)),
      },
      { find: '@pages', replacement: fileURLToPath(new URL('./src/pages', import.meta.url)) },
      { find: '@shared', replacement: fileURLToPath(new URL('./src/shared', import.meta.url)) },
      { find: '@styles', replacement: fileURLToPath(new URL('./src/styles', import.meta.url)) },
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  test: {
    environment: 'node',
    globals: true,
  },
});
