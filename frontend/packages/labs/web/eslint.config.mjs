import {globalIgnores} from 'eslint/config';

import cdoLabConfig from '@code-dot-org/lint-config/eslint/lab.mjs';

export default [
  globalIgnores(['dist']),
  ...cdoLabConfig,
  {
    // The dev harness and the entrypoint test play the host role (like Studio),
    // so they may import @code-dot-org/lab/host.
    files: ['src/main.tsx', 'src/__tests__/App.test.tsx'],
    rules: {'no-restricted-imports': 'off'},
  },
];
