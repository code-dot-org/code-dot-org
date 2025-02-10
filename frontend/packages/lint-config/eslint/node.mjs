import globals from 'globals';
import cdoBase from './base.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [{languageOptions: {globals: {...globals.node}}}, ...cdoBase];
