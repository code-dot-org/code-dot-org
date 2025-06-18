import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import-x';
import {configs as tseslintConfig} from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...tseslintConfig.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    rules: {
      'import-x/no-cycle': 'error',
      'import-x/no-duplicates': 'error',
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
            {
              pattern: '@code-dot-org/**',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '@cdo/**',
              group: 'internal',
              position: 'before',
            },
          ],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroupsExcludedImportTypes: ['builtin', 'object'],
        },
      ],
    },
  },
];
