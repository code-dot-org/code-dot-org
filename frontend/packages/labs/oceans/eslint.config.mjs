import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

export default [
  globalIgnores(['dist']),
  ...cdoReactConfig,
  {
    rules: {
      // TODO: fix in a dedicated a11y pass after Phase 7 TS migration. The
      // pre-existing click handlers on divs and spans need keyboard equivalents
      // or replacement with semantic button/anchor elements.
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-tabindex': 'off',

      // TODO: resolve circular dependency cycles after Phase 7 TS migration.
      // Current cycles: models/loading ↔ modeHelpers ↔ models/index. Breaking
      // them requires extracting shared state into a dedicated module.
      'import-x/no-cycle': 'off',
    },
  },
];
