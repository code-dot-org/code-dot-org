import DarkTheme from '@blockly/theme-dark';
import GoogleBlockly from 'blockly/core';
import {cdoBlockStyles} from './cdoTheme.js';

const blockStyles = cdoBlockStyles;
const categoryStyles = {};
const componentStyles = {
  toolboxBackgroundColour: '#424242', // gray-800
  flyoutBackgroundColour: '#9e9e9e', // gray-500
  workspaceBackgroundColour: '#212121' // gray-900
};

export const musicLabDarkTheme = GoogleBlockly.Theme.defineTheme(
  'musicLabDark',
  {
    base: DarkTheme,
    blockStyles,
    categoryStyles,
    componentStyles,
    fontStyle: {
      family: '"Gotham 4r", sans-serif',
      size: 10.5
    }
  }
);
