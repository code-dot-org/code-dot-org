import vitest from '@vitest/eslint-plugin';
import {globalIgnores} from 'eslint/config';

import cdoLabConfig from '@code-dot-org/lint-config/eslint/lab.mjs';

export default [
  globalIgnores(['dist']),
  ...cdoLabConfig,
  // The migrated test suite calls vitest's global APIs (vitest.config sets
  // `globals: true`) from `.test.js` files. The shared vitest eslint config
  // only targets `.test.{ts,tsx}` and supplies the plugin rules but not the
  // globals, so wire both for this package's `.js` tests here.
  {
    files: ['test/**/*.{js,ts,tsx}'],
    plugins: {vitest},
    languageOptions: {globals: vitest.configs.env.languageOptions.globals},
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // False positives: these AST-based rules can't model the `export =`
      // synthetic default that TypeScript accepts for CJS deps (react,
      // papaparse), so they flag correct default imports. Off for this package.
      'import-x/default': 'off',
      'import-x/no-named-as-default-member': 'off',
    },
  },
];
