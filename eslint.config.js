import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist', 'coverage', 'node_modules', 'src/**/*.ts', 'src/**/*.tsx'],
  },
  js.configs.recommended,
  {
    files: ['*.js', '*.mjs', '*.cjs'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
  },
  {
    files: ['public/service-worker.js'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.serviceworker,
    },
  },
];
