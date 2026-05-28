import vitest from '@vitest/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.test.{ts,tsx}'],
    ...vitest.configs.recommended,
  },
];
