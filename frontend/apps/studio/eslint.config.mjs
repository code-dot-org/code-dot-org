import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  globalIgnores(['dist', 'public/vite*', 'vite.config.ts']),
  ...cdoReactConfig,
];
