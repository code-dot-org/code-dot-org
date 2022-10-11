import CdoTheme from '@cdo/apps/blockly/addons/cdoTheme';
import GoogleBlockly from 'blockly/core';
import color from '../../util/color';

const blockStyles = {};
const categoryStyles = {};
const componentStyles = {
  toolboxBackgroundColour: color.charcoal,
  flyoutBackgroundColour: color.light_gray
};

export const musicLabDarkTheme = GoogleBlockly.Theme.defineTheme(
  'musicLabDark',
  {
    base: CdoTheme,
    blockStyles,
    categoryStyles,
    componentStyles
  }
);
