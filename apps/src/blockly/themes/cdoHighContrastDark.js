import GoogleBlockly from 'blockly/core';
import HighContrastTheme from '@blockly/theme-highcontrast';
import CdoDarkTheme from './cdoDark';
import {Themes} from '../constants';
import {cdoHighContrastBlockStyles} from './cdoHighContrast';

export default GoogleBlockly.Theme.defineTheme(Themes.HIGH_CONTRAST_DARK, {
  base: HighContrastTheme,
  blockStyles: cdoHighContrastBlockStyles,
  componentStyles: CdoDarkTheme.componentStyles,
  fontStyle: {
    family: '"Gotham 4r", sans-serif'
  }
});
