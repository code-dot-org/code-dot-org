import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

export default [
  // public/pyodide is vendored by scripts/setup-pyodide-assets.mjs and is not
  // committed (see .gitignore); linting it buries real findings under thousands
  // of errors as soon as anyone runs the demo.
  globalIgnores(['dist', 'public/pyodide']),
  ...cdoReactConfig,
];
