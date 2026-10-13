import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  globalIgnores([
    'dist',
    'dist-pwa',
    'public/vite*',
    'vite.config.ts',
    'vite.siteControls.config.ts',
  ]),
  ...cdoReactConfig,
  {settings: {'import-x/core-modules': ['virtual:pwa-register']}},
];
