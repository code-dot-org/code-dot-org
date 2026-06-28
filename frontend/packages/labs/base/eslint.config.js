import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import {defineConfig, globalIgnores} from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // labs/base (@code-dot-org/lab) is a leaf dependency: specific lab
      // packages depend on it, never the reverse. A `base -> specific-lab`
      // edge creates a dependency cycle and breaks the build. Lab selection
      // happens at the host via appName/LabRegistry, never a static import.
      // New lab packages following the `*-lab` convention are covered by the
      // glob; add any that do not (e.g. `ailab`) by name.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@code-dot-org/*-lab', '@code-dot-org/ailab'],
              message:
                'labs/base must not import a specific lab package — it is a leaf dependency. Labs depend on @code-dot-org/lab, never the reverse. Select labs at the host via appName/LabRegistry instead.',
            },
          ],
        },
      ],
    },
  },
]);
