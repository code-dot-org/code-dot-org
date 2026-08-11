import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';
import cdoVitestConfig from '@code-dot-org/lint-config/eslint/vitest.mjs';

export default [
  globalIgnores(['dist']),
  ...cdoReactConfig,
  ...cdoVitestConfig,
  {
    // `@cdo/*` resolves through a serve-only Vite alias into apps/, which the
    // import resolver has no view of. Types come from src/dev/cdo-ambient.d.ts.
    files: ['src/dev/**/*.{ts,tsx}'],
    rules: {'import-x/no-unresolved': ['error', {ignore: ['^@cdo/']}]},
  },
];
