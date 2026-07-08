import {globalIgnores} from 'eslint/config';

import cdoLabConfig from '@code-dot-org/lint-config/eslint/lab.mjs';
import cdoVitestConfig from '@code-dot-org/lint-config/eslint/vitest.mjs';

export default [globalIgnores(['dist']), ...cdoLabConfig, ...cdoVitestConfig];
