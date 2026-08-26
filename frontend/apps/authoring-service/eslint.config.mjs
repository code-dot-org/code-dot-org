import {globalIgnores} from 'eslint/config';

import cdoNodeConfig from '@code-dot-org/lint-config/eslint/node.mjs';
import cdoVitestConfig from '@code-dot-org/lint-config/eslint/vitest.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [globalIgnores(['dist']), ...cdoNodeConfig, ...cdoVitestConfig];
