import GoogleBlockly from 'blockly/core';
import DarkTheme from '@blockly/theme-dark';
import cdoBlockStyles from './cdoBlockStyles.mjs';
import {Themes} from '../constants.js';
import color from '../../util/color';

// https://github.com/google/blockly-samples/blob/master/plugins/theme-dark/src/index.js
export default GoogleBlockly.Theme.defineTheme(Themes.DARK, {
  base: DarkTheme,
  blockStyles: cdoBlockStyles,
  componentStyles: {
    workspaceBackgroundColour: color.neutral_dark90,
    blackBackground: color.neutral_dark80,
    flyoutBackgroundColour: color.neutral_dark70
  },
  fontStyle: {
    family: '"Gotham 4r", sans-serif'
  }
});
