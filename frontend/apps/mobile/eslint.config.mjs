import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  globalIgnores([
    'android',
    'capacitor.config.ts',
    'dist',
    'vite.config.ts',
    'vite.siteControls.config.ts',
  ]),
  ...cdoReactConfig,
];
