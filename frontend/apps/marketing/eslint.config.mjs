import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';
import cdoJestConfig from '@code-dot-org/lint-config/eslint/jest.mjs';
import nextPlugin from '@next/eslint-plugin-next';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['.next/*'],
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
  },
  ...cdoReactConfig,
  ...cdoJestConfig,
];
