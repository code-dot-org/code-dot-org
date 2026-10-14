import cdoLabConfig from '@code-dot-org/lint-config/eslint/lab.mjs';
import vitest from '@vitest/eslint-plugin';
import {globalIgnores} from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';

/*
  This package is moving into the main repo's `apps/` directory, which lints
  with its own eslintrc. The blocks below bring the rules that differ into line
  with apps' so the move itself carries no lint fallout; drop them once the
  move lands.
*/
const matchesApps = [
  {
    rules: {
      // The shared config assumes the automatic JSX runtime; apps uses the
      // classic one, which needs React in scope.
      'react/react-in-jsx-scope': 'error',
      'react/jsx-uses-react': 'error',
      'react/button-has-type': 'error',
      'react/prop-types': 'error',
      // The shared config allows a type-only and a value import of the same
      // module side by side; apps' `no-duplicate-imports` does not.
      'no-duplicate-imports': 'error',
      // apps groups `@code-dot-org/*` with the other external packages rather
      // than giving it a block of its own.
      'import-x/order': [
        'error',
        {
          'newlines-between': 'always',
          groups: [
            ['builtin', 'external'],
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            {
              pattern: '*.scss',
              group: 'index',
              position: 'after',
              patternOptions: {matchBase: true},
            },
            {pattern: '@cdo/**', group: 'internal', position: 'before'},
          ],
          alphabetize: {order: 'asc', caseInsensitive: true},
          pathGroupsExcludedImportTypes: ['builtin', 'object'],
        },
      ],
    },
  },
  {
    // The shared config carries no react-hooks plugin; apps errors on both.
    plugins: {'react-hooks': reactHooks},
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
    },
  },
  {
    // Types stand in for prop types, as they do in apps.
    files: ['**/*.{ts,tsx}'],
    rules: {'react/prop-types': 'off'},
  },
  {
    files: ['test/**'],
    rules: {
      // Mirrors apps' rule steering tests toward accessible queries.
      'no-restricted-properties': [
        'error',
        {
          object: 'container',
          property: 'querySelector',
          message:
            'Tests should resemble how the user interacts with the application. See https://testing-library.com/docs/queries/about/#priority',
        },
      ],
    },
  },
];

export default [
  globalIgnores(['dist']),
  ...cdoLabConfig,
  ...matchesApps,
  // The migrated test suite calls vitest's global APIs (vitest.config sets
  // `globals: true`) from `.test.js` files. The shared vitest eslint config
  // only targets `.test.{ts,tsx}` and supplies the plugin rules but not the
  // globals, so wire both for this package's `.js` tests here.
  {
    files: ['test/**/*.{js,ts,tsx}'],
    plugins: {vitest},
    languageOptions: {globals: vitest.configs.env.languageOptions.globals},
  },
  {
    files: ['src/**/*.{ts,tsx}', 'test/**/*.{js,ts,tsx}'],
    rules: {
      // False positives: these AST-based rules can't model the `export =`
      // synthetic default that TypeScript accepts for CJS deps (react,
      // papaparse), so they flag correct default imports. Off for this package.
      'import-x/default': 'off',
      'import-x/no-named-as-default-member': 'off',
    },
  },
];
