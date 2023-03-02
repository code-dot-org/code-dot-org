import GoogleBlockly from 'blockly/core';
import DarkTheme from '@blockly/theme-dark';
import cdoBlockStyles from './cdoBlockStyles.mjs';

// https://github.com/google/blockly-samples/blob/master/plugins/theme-dark/src/index.js
export default GoogleBlockly.Theme.defineTheme('cdoDark', {
  base: DarkTheme,
  blockStyles: cdoBlockStyles
});
