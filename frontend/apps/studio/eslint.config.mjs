import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  globalIgnores([
    'dist',
    'dist-mobile',
    'public/vite*',
    'src/routeTree.mobile.gen.ts',
    'vite.config.ts',
    'vite.mobile.config.ts',
  ]),
  ...cdoReactConfig,
];
