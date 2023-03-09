import {makeEnum} from '@cdo/apps/utils';

export const ToolboxType = makeEnum('CATEGORIZED', 'UNCATEGORIZED', 'NONE');
export const BLOCKLY_THEME = 'blocklyTheme';
export const MenuOptionStates = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  HIDDEN: 'hidden'
};

export const Themes = {
  MODERN: 'modern',
  DARK: 'dark',
  HIGH_CONTRAST: 'highcontrast',
  PROTANOPIA: 'protanopia',
  DEUTERANOPIA: 'deuteranopia',
  TRITANOPIA: 'tritanopia',
  MUSICLAB_DARK: 'musiclabdark',
  MUSICLAB_HIGH_CONTRAST: 'musiclabhighcontrast',
  MUSICLAB_PROTANOPIA: 'musiclabprotanopia',
  MUSICLAB_DEUTERANOPIA: 'musiclabdeuteranopia',
  MUSICLAB_TRITANOPIA: 'musiclabtritanopia'
};

// Used for custom field type ClampedNumber(,)
// Captures two optional arguments from the type string
// Allows:
//   ClampedNumber(x,y)
//   ClampedNumber( x , y )
//   ClampedNumber(,y)
//   ClampedNumber(x,)
//   ClampedNumber(,)
export const CLAMPED_NUMBER_REGEX = /^ClampedNumber\(\s*([\d.]*)\s*,\s*([\d.]*)\s*\)$/;
