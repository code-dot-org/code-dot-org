import {globalIgnores} from 'eslint/config';

import cdoBaseConfig from '@code-dot-org/lint-config/eslint/base.mjs';

export default [globalIgnores(['dist']), ...cdoBaseConfig];
