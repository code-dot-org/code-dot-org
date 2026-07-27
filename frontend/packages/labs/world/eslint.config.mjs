import {globalIgnores} from 'eslint/config';

import cdoLabConfig from '@code-dot-org/lint-config/eslint/lab.mjs';

export default [
  // `spikes/` holds throwaway de-risking harnesses (browser globals, console
  // logging, Node scripts) that are not part of the build or its tests.
  globalIgnores(['dist', 'spikes']),
  ...cdoLabConfig,
  {
    // The dev harness and the entrypoint test play the host role (like Studio),
    // so they may import @code-dot-org/lab/host.
    files: ['src/main.tsx', 'src/__tests__/App.test.tsx'],
    rules: {'no-restricted-imports': 'off'},
  },
];
