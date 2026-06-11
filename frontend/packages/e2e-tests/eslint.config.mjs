import {globalIgnores} from 'eslint/config';

import cdoNodeConfig from '@code-dot-org/lint-config/eslint/node.mjs';

export default [
  globalIgnores(['playwright-report', 'test-results']),
  ...cdoNodeConfig,
];
