import {globalIgnores} from 'eslint/config';

import cdoLabConfig from '@code-dot-org/lint-config/eslint/lab.mjs';
import cdoVitestConfig from '@code-dot-org/lint-config/eslint/vitest.mjs';

export default [
  globalIgnores(['dist']),
  ...cdoLabConfig,
  ...cdoVitestConfig,
  {
    // The dev harness plays the host role (like Studio), so it may import
    // @code-dot-org/lab/host.
    files: ['src/main.tsx'],
    rules: {'no-restricted-imports': 'off'},
  },
];
