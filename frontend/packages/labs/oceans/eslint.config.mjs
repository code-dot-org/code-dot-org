import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

export default [
  globalIgnores(['dist']),
  ...cdoReactConfig,
  {
    rules: {
      // TODO: resolve circular dependency cycles after Phase 7 TS migration.
      // Current cycles: models/loading ↔ modeHelpers ↔ models/index. Breaking
      // them requires extracting shared state into a dedicated module.
      'import-x/no-cycle': 'off',
    },
  },
];
