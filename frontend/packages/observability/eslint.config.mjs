import reactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

export default [
  ...reactConfig,
  {
    ignores: ['dist/*'],
  },
];
