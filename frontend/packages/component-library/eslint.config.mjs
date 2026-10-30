import storybook from 'eslint-plugin-storybook';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';
import cdoVitestConfig from '@code-dot-org/lint-config/eslint/vitest.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['dist/*'],
  },
  ...storybook.configs['flat/recommended'],
  ...cdoReactConfig,
  ...cdoVitestConfig,
  {
    rules: {
      'import-x/no-unresolved': [
        'error',
        {ignore: ['\\./index.css', '^\\@public/']},
      ],
    },
  },
];
