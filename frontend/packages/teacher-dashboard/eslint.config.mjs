import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';
import cdoVitestConfig from '@code-dot-org/lint-config/eslint/vitest.mjs';

export default [
  globalIgnores(['dist', 'e2e/tmp']),
  ...cdoReactConfig,
  ...cdoVitestConfig,
];
