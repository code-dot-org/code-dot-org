import GoogleBlockly from 'blockly/core';
import DarkTheme from '@blockly/theme-dark';
import {cdoBlockStyles} from './cdoTheme';

export const CdoDarkTheme = GoogleBlockly.Theme.defineTheme('cdoDark', {
  base: DarkTheme,
  blockStyles: cdoBlockStyles
});
