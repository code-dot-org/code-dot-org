import GoogleBlockly from 'blockly/core';

import {Themes} from '../constants';

import {
  deuteranopiaBlockStyles,
  protanopiaBlockStyles,
  tritanopiaBlockStyles,
} from './cdoAccessibleStyles';
import CdoDarkTheme from './cdoDark';

export const CdoProtanopiaDarkTheme = GoogleBlockly.Theme.defineTheme(
  Themes.PROTANOPIA_DARK,
  {
    base: CdoDarkTheme,
    blockStyles: protanopiaBlockStyles,
  }
);

export const CdoDeuteranopiaDarkTheme = GoogleBlockly.Theme.defineTheme(
  Themes.DEUTERANOPIA_DARK,
  {
    base: CdoDarkTheme,
    blockStyles: deuteranopiaBlockStyles,
  }
);

export const CdoTritanopiaDarkTheme = GoogleBlockly.Theme.defineTheme(
  Themes.TRITANOPIA_DARK,
  {
    base: CdoDarkTheme,
    blockStyles: tritanopiaBlockStyles,
  }
);
