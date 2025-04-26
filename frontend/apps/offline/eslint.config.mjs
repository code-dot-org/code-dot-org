import nextPlugin from '@next/eslint-plugin-next';

import cdoJestConfig from '@code-dot-org/lint-config/eslint/jest.mjs';
import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '.next/*',
      'playwright-report',
      'test-results',
      'public/**',
      'data/**',
      '*.md',
    ],
  },
  {
    // TODO: Remove this once the following Github Issue is resolved:
    // https://github.com/vercel/next.js/issues/71763
    name: 'Next.js Linter',
    plugins: {
      '@next/next': nextPlugin,
      rules: {
        ...nextPlugin.configs.recommended.rules,
        ...nextPlugin.configs['core-web-vitals'].rules,
      },
    },
    rules: {
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
  ...cdoReactConfig,
  ...cdoJestConfig,
];
