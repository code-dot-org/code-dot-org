import CdoTheme from '@cdo/apps/blockly/addons/cdoTheme';
import GoogleBlockly from 'blockly/core';
import {cdoBlockStyles} from '../../blockly/addons/cdoTheme.js';

const blockStyles = cdoBlockStyles;
const categoryStyles = {};
const componentStyles = {
  toolboxBackgroundColour: '#424242', // gray-800
  flyoutBackgroundColour: '#121212',
  workspaceBackgroundColour: '#212121' // gray-900
};

export const musicLabDarkTheme = GoogleBlockly.Theme.defineTheme(
  'musicLabDark',
  {
    base: CdoTheme,
    blockStyles,
    categoryStyles,
    componentStyles,
    fontStyle: {
      family: '"Gotham 4r", sans-serif'
    }
  }
);
