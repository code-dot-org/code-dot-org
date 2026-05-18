import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

export default [
  globalIgnores(['dist', 'playwright-report', 'test-results']),
  ...cdoReactConfig,
];
