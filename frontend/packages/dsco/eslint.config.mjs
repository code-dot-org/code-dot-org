import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';
import cdoJestConfig from '@code-dot-org/lint-config/eslint/jest.mjs';
import storybook from 'eslint-plugin-storybook';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['dist/*'],
  },
  ...storybook.configs['flat/recommended'],
  ...cdoReactConfig,
  ...cdoJestConfig,
  {
    // Allow `clean-package` to use require as it does not work in ESM today.
    files: ['clean-package.config.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
