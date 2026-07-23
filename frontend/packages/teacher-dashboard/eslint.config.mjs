import {globalIgnores} from 'eslint/config';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';
import cdoVitestConfig from '@code-dot-org/lint-config/eslint/vitest.mjs';

export default [
  globalIgnores(['dist']),
  ...cdoReactConfig,
  ...cdoVitestConfig,
  // Register react-hooks plugin so eslint-disable comments in moved files
  // that reference react-hooks/* rules don't cause "unknown rule" errors.
  {
    plugins: {'react-hooks': reactHooksPlugin},
  },
  // Permissive overrides for files moved from apps/ (different eslint config).
  // These will be cleaned up incrementally; the move itself stays byte-identical.
  {
    files: [
      'src/home/**/*.{ts,tsx,js,jsx}',
      'src/redux/**/*.{ts,tsx,js,jsx}',
      'src/stubs/**/*.{ts,tsx,d.ts}',
      'src/devhost/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'import-x/default': 'off',
      'import-x/order': 'off',
      'import-x/no-unresolved': 'off',
      'import-x/named': 'off',
      'import-x/namespace': 'off',
      'import-x/no-named-as-default': 'off',
      'import-x/no-named-as-default-member': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'no-console': 'off',
      'no-empty': 'off',
      'no-undef': 'off',
      'react/jsx-key': 'off',
      'import-x/no-cycle': 'off',
    },
  },
];
