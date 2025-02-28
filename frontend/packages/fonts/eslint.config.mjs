import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';
import cdoJestConfig from '@code-dot-org/lint-config/eslint/jest.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['dist/*'],
  },
  ...cdoReactConfig,
  ...cdoJestConfig,
];
