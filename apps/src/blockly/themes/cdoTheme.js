import GoogleBlockly from 'blockly/core';
import {Themes} from '../constants.js';
import cdoBlockStyles from './cdoBlockStyles.mjs';

export default GoogleBlockly.Theme.defineTheme(Themes.MODERN, {
  base: GoogleBlockly.Themes.Classic,
  blockStyles: cdoBlockStyles,
  categoryStyles: {},
  componentStyles: {
    toolboxBackgroundColour: '#DDDDDD'
  },
  fontStyle: {
    family: '"Gotham 4r", sans-serif'
  },
  startHats: null
});
