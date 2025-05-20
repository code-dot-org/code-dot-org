import cdoJestConfig from '@code-dot-org/lint-config/eslint/jest.mjs';
import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['dist/*'],
  },
  ...cdoReactConfig,
  ...cdoJestConfig,
];
