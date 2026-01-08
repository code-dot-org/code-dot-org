import HighContrastTheme from '@blockly/theme-highcontrast';
import * as BlocklyCore from 'blockly/core';

import fontConstants from '@cdo/apps/fontConstants';

import {Themes} from '../constants';

import CdoDarkTheme from './cdoDark';
import {cdoHighContrastBlockStyles} from './cdoHighContrast';

export default BlocklyCore.Theme.defineTheme(Themes.HIGH_CONTRAST_DARK, {
  base: HighContrastTheme,
  blockStyles: cdoHighContrastBlockStyles,
  componentStyles: CdoDarkTheme.componentStyles,
  fontStyle: {
    family: fontConstants['main-font'],
    weight: fontConstants['regular-font-weight'],
  },
});
