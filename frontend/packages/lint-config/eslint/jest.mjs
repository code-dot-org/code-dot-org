import jest from 'eslint-plugin-jest';

/** @type {import('eslint').Linter.Config} */
export default [
  {
    files: ['**/**.test.tsx'],
    ...jest.configs['flat/recommended'],
  },
];
