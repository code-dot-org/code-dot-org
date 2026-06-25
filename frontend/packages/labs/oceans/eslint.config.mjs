import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

export default [
  globalIgnores(['dist', 'e2e/tmp']),
  ...cdoReactConfig,
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@code-dot-org/lab',
              message:
                'Embeddable labs must not depend on the framework package. Host wiring belongs in Studio adapters.',
            },
          ],
        },
      ],
    },
  },
];
