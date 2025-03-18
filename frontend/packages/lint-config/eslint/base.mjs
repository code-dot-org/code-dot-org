import importPlugin from 'eslint-plugin-import-x';
import {configs as tseslintConfig} from 'typescript-eslint';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  ...tseslintConfig.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    rules: {
      'import-x/no-cycle': 'error',
      'import-x/no-unresolved': 'off', // https://codedotorg.atlassian.net/browse/ACQ-2875
    },
  },
];
