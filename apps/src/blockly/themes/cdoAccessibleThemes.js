import GoogleBlockly from 'blockly/core';
import {
  deuteranopiaBlockStyles,
  protonopiaBlockStyles,
  tritanopiaBlockStyles
} from './cdoAccessibleStyles';

export const CdoProtonopiaTheme = GoogleBlockly.Theme.defineTheme(
  'cdoprotonopia',
  {
    base: GoogleBlockly.Themes.Classic,
    blockStyles: protonopiaBlockStyles,
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
