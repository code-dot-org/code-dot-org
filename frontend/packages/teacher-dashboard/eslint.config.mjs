import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';
import cdoVitestConfig from '@code-dot-org/lint-config/eslint/vitest.mjs';

export default [
  globalIgnores(['dist']),
  ...cdoReactConfig,
  ...cdoVitestConfig,
  // Permissive overrides for files moved from apps/ (different eslint config).
  // These will be cleaned up incrementally; the move itself stays byte-identical.
  {
    files: ['src/home/**/*.{ts,tsx}', 'src/devhost/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'import-x/default': 'off',
      'import-x/order': 'off',
      'import-x/no-unresolved': 'off',
      'import-x/no-named-as-default-member': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
    },
  },
];
