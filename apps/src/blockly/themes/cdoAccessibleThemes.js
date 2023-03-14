import GoogleBlockly from 'blockly/core';
import {Themes} from '../constants';
import {
  deuteranopiaBlockStyles,
  protanopiaBlockStyles,
  tritanopiaBlockStyles
} from './cdoAccessibleStyles';

export const CdoProtanopiaTheme = GoogleBlockly.Theme.defineTheme(
  Themes.PROTANOPIA,
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
  Themes.DEUTERANOPIA,
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
  Themes.TRITANOPIA,
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
