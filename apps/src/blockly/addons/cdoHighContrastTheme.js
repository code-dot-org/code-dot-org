import HighContrastTheme from '@blockly/theme-highcontrast';
import {convertToHighContrast} from './cdoUtils.js';
import GoogleBlockly from 'blockly/core';
import {cdoCustomStyles, coreBlocklyOverrides} from './cdoTheme.js';

const getCdoHighContrastStylesObject = obj => {
  let highConstrastObj = {};
  Object.keys(obj).forEach(key => {
    highConstrastObj[key] = {
      colourPrimary: convertToHighContrast(obj[key].colourPrimary)
    };
  });
  return highConstrastObj;
};

const cdoHighContrastStyles = {
  ...HighContrastTheme.blockStyles,
  ...getCdoHighContrastStylesObject({
    ...coreBlocklyOverrides,
    ...cdoCustomStyles
  })
};

export const CdoHighContrastTheme = GoogleBlockly.Theme.defineTheme(
  'cdoHighContrast',
  {
    base: HighContrastTheme,
    blockStyles: cdoHighContrastStyles
  }
);
