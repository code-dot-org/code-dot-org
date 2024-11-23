import globals from 'globals';
import cdoBase from './base.mjs';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}']},
  {languageOptions: {globals: {...globals.node, ...globals.browser}}},
  ...cdoBase,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat['jsx-runtime'],
    settings: {react: {version: 'detect'}},
  },
];
