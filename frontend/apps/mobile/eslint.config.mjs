import {globalIgnores} from 'eslint/config';

import cdoNodeConfig from '@code-dot-org/lint-config/eslint/node.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [globalIgnores(['android']), ...cdoNodeConfig];
