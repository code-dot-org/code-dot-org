import {globalIgnores} from 'eslint/config';
import globals from 'globals';

import base from '@code-dot-org/lint-config/eslint/base.mjs';
import node from '@code-dot-org/lint-config/eslint/node.mjs';
import vitest from '@code-dot-org/lint-config/eslint/vitest.mjs';

export default [
  globalIgnores(['android/**', 'dist/**']),
  ...base,
  ...node.map(config => ({...config, files: ['*.{ts,mjs}']})),
  {files: ['src/**/*.ts'], languageOptions: {globals: globals.browser}},
  ...vitest,
];
