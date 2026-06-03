import vitest from '@vitest/eslint-plugin';
import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

export default [
  globalIgnores(['dist']),
  ...cdoReactConfig,
  // The migrated test suite calls vitest's global APIs (vitest.config sets
  // `globals: true`) from `.test.js` files. The shared vitest eslint config
  // only targets `.test.{ts,tsx}` and supplies the plugin rules but not the
  // globals, so wire both for this package's `.js` tests here.
  {
    files: ['test/**/*.{js,ts,tsx}'],
    plugins: {vitest},
    languageOptions: {globals: vitest.configs.env.languageOptions.globals},
  },
  // The migrated ml-playground source predates the shared config. These rules
  // fire on pre-existing patterns: real circular imports between the store
  // singleton and its consumers, unused bindings, a couple of `any`s, and
  // false-positive CJS-default-interop reports on react/papaparse. Relaxed so
  // the toolchain swap stays mechanical; untangling the cycles and tightening
  // the rest is a tracked follow-up cleanup. (`import-x/order` stays on.)
  {
    files: ['src/**/*.{ts,tsx}', 'test/**/*.{js,ts,tsx}'],
    rules: {
      'import-x/no-cycle': 'off',
      'import-x/default': 'off',
      'import-x/no-named-as-default-member': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
