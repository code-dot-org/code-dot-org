import {globalIgnores} from 'eslint/config';

import base from '@code-dot-org/lint-config/eslint/base.mjs';
import node from '@code-dot-org/lint-config/eslint/node.mjs';

export default [
  globalIgnores(['android/**', 'ios/**', 'dist/**']),
  ...base,
  ...node.map(config => ({...config, files: ['*.{ts,mjs}']})),
];
