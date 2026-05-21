import {globalIgnores} from 'eslint/config';

import cdoReactConfig from '@code-dot-org/lint-config/eslint/react.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  globalIgnores(['dist', 'public/vite*', 'vite.config.ts']),
  ...cdoReactConfig,
  {
    rules: {
      // Vite virtual modules (`virtual:pwa-register`, `virtual:uno.css`, etc.)
      // resolve at build time through plugins, so the static resolver can't
      // find them on disk. Whitelist the scheme rather than per-import disables.
      // @code-dot-org/notebook-lab is a workspace package whose dist has no
      // .d.ts files yet; the exports "types" condition fails the static resolver.
      'import-x/no-unresolved': [
        'error',
        {ignore: ['^virtual:', '^@code-dot-org/notebook-lab']},
      ],
    },
  },
];
