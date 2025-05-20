import storybook from 'eslint-plugin-storybook';

import cdoJestConfig from '@code-dot-org/lint-config/eslint/jest.mjs';
import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['dist/*'],
  },
  ...storybook.configs['flat/recommended'],
  ...cdoReactConfig,
  ...cdoJestConfig,
  {
    rules: {
      'import-x/no-unresolved': [
        'error',
        {ignore: ['\\./index.css', '^\\@public/']},
      ],
    },
  },
];
