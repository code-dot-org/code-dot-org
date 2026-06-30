import {globalIgnores} from 'eslint/config';

import cdoNodeConfig from '@code-dot-org/lint-config/eslint/node.mjs';

export default [
  globalIgnores(['playwright-report', 'test-results']),
  ...cdoNodeConfig,
  {
    // Funnel axe through tests/shared/axe so every scan settles and scopes.
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@axe-core/playwright',
              message:
                'Import analyze() from tests/shared/axe instead; it settles and scopes the scan.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['tests/shared/axe.ts'],
    rules: {'no-restricted-imports': 'off'},
  },
];
