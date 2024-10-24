import DarkTheme from '@blockly/theme-dark';
import * as GoogleBlockly from 'blockly/core';

import fontConstants from '@cdo/apps/fontConstants';

import color from '../../util/color';
import {Themes} from '../constants';

import cdoBlockStyles from './cdoBlockStyles.js';

// https://github.com/google/blockly-samples/blob/master/plugins/theme-dark/src/index.js
export default GoogleBlockly.Theme.defineTheme(Themes.DARK, {
  base: DarkTheme,
  blockStyles: cdoBlockStyles,
  componentStyles: {
    workspaceBackgroundColour: color.neutral_dark,
    blackBackground: color.light_gray_950,
    flyoutBackgroundColour: color.light_gray_950,
    flyoutOpacity: 0.8,
  },
  fontStyle: {
    family: fontConstants['main-font'],
    weight: fontConstants['regular-font-weight'],
  },
});
