import * as BlocklyCore from 'blockly/core';

import {Themes} from '../constants';

import {
  deuteranopiaBlockStyles,
  protanopiaBlockStyles,
  tritanopiaBlockStyles,
} from './cdoAccessibleStyles';
import CdoDarkTheme from './cdoDark';

export const CdoProtanopiaDarkTheme = BlocklyCore.Theme.defineTheme(
  Themes.PROTANOPIA_DARK,
  {
    base: CdoDarkTheme,
    blockStyles: protanopiaBlockStyles,
  }
);

export const CdoDeuteranopiaDarkTheme = BlocklyCore.Theme.defineTheme(
  Themes.DEUTERANOPIA_DARK,
  {
    base: CdoDarkTheme,
    blockStyles: deuteranopiaBlockStyles,
  }
);

export const CdoTritanopiaDarkTheme = BlocklyCore.Theme.defineTheme(
  Themes.TRITANOPIA_DARK,
  {
    base: CdoDarkTheme,
    blockStyles: tritanopiaBlockStyles,
  }
);
