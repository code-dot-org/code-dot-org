import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

export default [
  globalIgnores(['dist']),
  ...cdoReactConfig,
  {
    // `@cdo/*` resolves through a serve-only Vite alias into apps/, which the
    // import resolver has no view of. Types come from src/dev/cdo-ambient.d.ts.
    files: ['src/dev/**/*.{ts,tsx}'],
    rules: {'import-x/no-unresolved': ['error', {ignore: ['^@cdo/']}]},
  },
];
