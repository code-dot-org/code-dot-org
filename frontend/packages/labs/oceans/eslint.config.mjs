import {globalIgnores} from 'eslint/config';

import cdoLabConfig from '@code-dot-org/lint-config/eslint/lab.mjs';

export default [globalIgnores(['dist', 'e2e/tmp']), ...cdoLabConfig];
