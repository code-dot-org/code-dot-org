import GoogleBlockly from 'blockly/core';
import HighContrastTheme from '@blockly/theme-highcontrast';
import fontConstants from '@cdo/apps/fontConstants';
import CdoDarkTheme from './cdoDark';
import {Themes} from '../constants';
import {cdoHighContrastBlockStyles} from './cdoHighContrast';

export default GoogleBlockly.Theme.defineTheme(Themes.HIGH_CONTRAST_DARK, {
  base: HighContrastTheme,
  blockStyles: cdoHighContrastBlockStyles,
  componentStyles: CdoDarkTheme.componentStyles,
  fontStyle: {
    family: fontConstants['main-font'],
    weight: fontConstants['regular-font-weight'],
  },
});
