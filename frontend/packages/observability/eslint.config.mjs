import reactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

export default [
  ...reactConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // Allow underscore-prefixed parameters in no-op adapter methods
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];
