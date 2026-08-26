import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';
import cdoVitestConfig from '@code-dot-org/lint-config/eslint/vitest.mjs';

export default [
  globalIgnores(['dist']),
  ...cdoReactConfig,
  ...cdoVitestConfig,
  {
    rules: {
      // import-x's resolver can't follow @modelcontextprotocol/sdk's
      // wildcard "exports" map (its `types` condition mis-substitutes a
      // ".js.d.ts" path that doesn't exist); tsc and Vite both resolve
      // these subpaths correctly via moduleResolution: bundler.
      'import-x/no-unresolved': [
        'error',
        {ignore: ['^@modelcontextprotocol/sdk']},
      ],
    },
  },
];
