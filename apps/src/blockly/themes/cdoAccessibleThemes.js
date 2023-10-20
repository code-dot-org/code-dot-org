import GoogleBlockly from 'blockly/core';
import fontConstants from '@cdo/apps/fontConstants';
import {Themes} from '../constants';
import {
  deuteranopiaBlockStyles,
  protanopiaBlockStyles,
  tritanopiaBlockStyles,
} from './cdoAccessibleStyles';

const protanopiaBlockStylesWithAi = {
  ...protanopiaBlockStyles,
  ai_blocks: {colourPrimary: '#566065'},
};

const deuteranopiaBlockStylesWithAi = {
  ...deuteranopiaBlockStyles,
  ai_blocks: {colourPrimary: '#566065'},
};

const tritanopiaBlockStylesWithAi = {
  ...tritanopiaBlockStyles,
  ai_blocks: {colourPrimary: '#566065'},
};

export const CdoProtanopiaTheme = GoogleBlockly.Theme.defineTheme(
  Themes.PROTANOPIA,
  {
    base: GoogleBlockly.Themes.Classic,
    blockStyles: protanopiaBlockStylesWithAi,
    categoryStyles: {},
    componentStyles: {
      toolboxBackgroundColour: '#DDDDDD',
    },
    fontStyle: {
      family: fontConstants['main-font'],
      weight: fontConstants['regular-font-weight'],
    },
    startHats: null,
  }
);

export const CdoDeuteranopiaTheme = GoogleBlockly.Theme.defineTheme(
  Themes.DEUTERANOPIA,
  {
    base: GoogleBlockly.Themes.Classic,
    blockStyles: deuteranopiaBlockStylesWithAi,
    categoryStyles: {},
    componentStyles: {
      toolboxBackgroundColour: '#DDDDDD',
    },
    fontStyle: {
      family: fontConstants['main-font'],
      weight: fontConstants['regular-font-weight'],
    },
    startHats: null,
  }
);

export const CdoTritanopiaTheme = GoogleBlockly.Theme.defineTheme(
  Themes.TRITANOPIA,
  {
    base: GoogleBlockly.Themes.Classic,
    blockStyles: tritanopiaBlockStylesWithAi,
    categoryStyles: {},
    componentStyles: {
      toolboxBackgroundColour: '#DDDDDD',
    },
    fontStyle: {
      family: fontConstants['main-font'],
      weight: fontConstants['regular-font-weight'],
    },
    startHats: null,
  }
);
