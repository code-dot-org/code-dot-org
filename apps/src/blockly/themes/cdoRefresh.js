import * as BlocklyCore from 'blockly/core';

import fontConstants from '@cdo/apps/fontConstants';

import {Themes} from '../constants';

import cdoDark from './cdoDark';
import cdoRefreshBlockStyles from './cdoRefreshBlockStyles';
import cdoTheme from './cdoTheme';

const refreshOverrides = {
  blockStyles: cdoRefreshBlockStyles,
  fontStyle: {
    family: fontConstants['main-font'],
    weight: fontConstants['semi-bold-font-weight'],
    size: 11,
  },
  // Gives every stack-starting block (when run, events) a Scratch-style hat.
  startHats: true,
};

export const CdoRefreshTheme = BlocklyCore.Theme.defineTheme(Themes.REFRESH, {
  base: cdoTheme,
  ...refreshOverrides,
});

export const CdoRefreshDarkTheme = BlocklyCore.Theme.defineTheme(
  Themes.REFRESH_DARK,
  {
    base: cdoDark,
    ...refreshOverrides,
  }
);
