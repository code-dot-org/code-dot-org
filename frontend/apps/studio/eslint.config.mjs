import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  globalIgnores(['dist', 'public/vite*', 'vite.config.ts']),
  ...cdoReactConfig,
  {
    rules: {
      // Prevent false positives on image imports
      'import-x/no-unresolved': ['error', {ignore: ['\\.webp$']}],
    },
  },
];
