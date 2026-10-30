import {globalIgnores} from 'eslint/config';

import cdoNodeConfig from '@code-dot-org/lint-config/eslint/node.mjs';

// sharedConstants.ts is generated. Plain lint passes, but --fix (and
// lint-staged's eslintFix) would strip the generator's /* eslint-disable */
// header as an unused directive. Ignore the file so its content always
// matches the generator's output.
export default [
  globalIgnores(['dist', 'src/sharedConstants.ts']),
  ...cdoNodeConfig,
];
