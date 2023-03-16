import GoogleBlockly from 'blockly/core';
import DarkTheme from '@blockly/theme-dark';
import cdoBlockStyles from './cdoBlockStyles.mjs';
import {Themes} from '../constants.js';

// https://github.com/google/blockly-samples/blob/master/plugins/theme-dark/src/index.js
export default GoogleBlockly.Theme.defineTheme(Themes.DARK, {
  base: DarkTheme,
  blockStyles: cdoBlockStyles,
  fontStyle: {
    family: '"Gotham 4r", sans-serif'
  }
});
