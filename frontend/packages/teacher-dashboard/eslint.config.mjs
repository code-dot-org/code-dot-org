import {globalIgnores} from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';
import cdoVitestConfig from '@code-dot-org/lint-config/eslint/vitest.mjs';

export default [
  globalIgnores(['dist']),
  ...cdoReactConfig,
  ...cdoVitestConfig,
  {
    files: ['**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
  },
];
