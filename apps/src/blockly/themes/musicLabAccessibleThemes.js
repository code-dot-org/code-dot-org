import GoogleBlockly from 'blockly/core';
import {
  deuteranopiaBlockStyles,
  protanopiaBlockStyles,
  tritanopiaBlockStyles
} from './cdoAccessibleStyles';
import MusicLabDark from './musicLabDark';

export const MusicLabProtanopiaTheme = GoogleBlockly.Theme.defineTheme(
  'musiclabprotanopia',
  {
    base: MusicLabDark,
    blockStyles: protanopiaBlockStyles
  }
);

export const MusicLabDeuteranopiaTheme = GoogleBlockly.Theme.defineTheme(
  'musiclabdeuteranopia',
  {
    base: MusicLabDark,
    blockStyles: deuteranopiaBlockStyles
  }
);

export const MusicLabTritanopiaTheme = GoogleBlockly.Theme.defineTheme(
  'musiclabtritanopia',
  {
    base: MusicLabDark,
    blockStyles: tritanopiaBlockStyles
  }
);
