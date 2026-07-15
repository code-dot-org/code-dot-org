import {globalIgnores} from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

export default [
  globalIgnores(['dist', 'public']),
  ...cdoReactConfig,
  reactHooks.configs.flat.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@cdo/apps', '@cdo/apps/*'],
              message:
                'Certificate pages must stay isolated from the legacy apps bundle.',
            },
            {
              group: ['react-bootstrap', 'react-bootstrap/*'],
              message:
                'Certificate pages must use the design system and MUI, not react-bootstrap.',
            },
          ],
        },
      ],
    },
  },
];
