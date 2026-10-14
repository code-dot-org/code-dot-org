import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  globalIgnores([
    'dist',
    'dist-mobile',
    'public/vite*',
    'vite.config.ts',
    'vite.mobile.config.ts',
  ]),
  ...cdoReactConfig,
];
