import importPlugin from 'eslint-plugin-import-x';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    rules: {
      'import-x/no-cycle': 'error',
    },
  },
];
