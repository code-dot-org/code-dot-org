import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['storybook-static/*'],
  },
  ...cdoReactConfig,
];
