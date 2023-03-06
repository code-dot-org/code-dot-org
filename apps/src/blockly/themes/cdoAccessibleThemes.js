import GoogleBlockly from 'blockly/core';
import {
  deuteranopiaBlockStyles,
  protanopiaBlockStyles,
  tritanopiaBlockStyles
} from './cdoAccessibleStyles';

export const CdoProtanopiaTheme = GoogleBlockly.Theme.defineTheme(
  'cdoprotanopia',
  {
    base: GoogleBlockly.Themes.Classic,
    blockStyles: protanopiaBlockStyles,
    categoryStyles: {},
    componentStyles: {
      toolboxBackgroundColour: '#DDDDDD'
    },
    fontStyle: {
      family: '"Gotham 4r", sans-serif'
    },
    startHats: null
  }
);

export const CdoDeuteranopiaTheme = GoogleBlockly.Theme.defineTheme(
  'cdodeuteranopia',
  {
    base: GoogleBlockly.Themes.Classic,
    blockStyles: deuteranopiaBlockStyles,
    categoryStyles: {},
    componentStyles: {
      toolboxBackgroundColour: '#DDDDDD'
    },
    fontStyle: {
      family: '"Gotham 4r", sans-serif'
    },
    startHats: null
  }
);

export const CdoTritanopiaTheme = GoogleBlockly.Theme.defineTheme(
  'cdotritanopia',
  {
    base: GoogleBlockly.Themes.Classic,
    blockStyles: tritanopiaBlockStyles,
    categoryStyles: {},
    componentStyles: {
      toolboxBackgroundColour: '#DDDDDD'
    },
    fontStyle: {
      family: '"Gotham 4r", sans-serif'
    },
    startHats: null
  }
);
