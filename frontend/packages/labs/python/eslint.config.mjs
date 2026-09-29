import {globalIgnores} from 'eslint/config';

import cdoLabConfig from '@code-dot-org/lint-config/eslint/lab.mjs';

export default [
  // public/pyodide is vendored by scripts/setup-pyodide-assets.mjs and is not
  // committed (see .gitignore); linting it buries real findings under thousands
  // of errors as soon as anyone runs the demo.
  globalIgnores(['dist', 'public/pyodide']),
  ...cdoLabConfig,
  {
    // The dev harness and the entrypoint test play the host role (like Studio),
    // so they may import @code-dot-org/lab/host.
    files: ['src/main.tsx', 'src/__tests__/App.test.tsx'],
    rules: {'no-restricted-imports': 'off'},
  },
];
