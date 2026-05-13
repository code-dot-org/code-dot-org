import * as BlocklyCore from 'blockly/core';

import fontConstants from '@cdo/apps/fontConstants';

import {Themes} from '../constants';

import {
  deuteranopiaBlockStyles,
  protanopiaBlockStyles,
  tritanopiaBlockStyles,
} from './cdoAccessibleStyles';

export const CdoProtanopiaTheme = BlocklyCore.Theme.defineTheme(
  Themes.PROTANOPIA,
  {
    base: BlocklyCore.Themes.Classic,
    blockStyles: protanopiaBlockStyles,
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

export const CdoDeuteranopiaTheme = BlocklyCore.Theme.defineTheme(
  Themes.DEUTERANOPIA,
  {
    base: BlocklyCore.Themes.Classic,
    blockStyles: deuteranopiaBlockStyles,
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

export const CdoTritanopiaTheme = BlocklyCore.Theme.defineTheme(
  Themes.TRITANOPIA,
  {
    base: BlocklyCore.Themes.Classic,
    blockStyles: tritanopiaBlockStyles,
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
