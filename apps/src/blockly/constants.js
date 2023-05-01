import {makeEnum} from '@cdo/apps/utils';

export const BlocklyVersion = {
  CDO: 'CDO',
  GOOGLE: 'Google',
};

export const ToolboxType = makeEnum('CATEGORIZED', 'UNCATEGORIZED', 'NONE');
export const BLOCKLY_THEME = 'blocklyTheme';
export const MenuOptionStates = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  HIDDEN: 'hidden',
};

export const Themes = {
  MODERN: 'cdomodern',
  DARK: 'cdomoderndark',
  HIGH_CONTRAST: 'cdohighcontrast',
  HIGH_CONTRAST_DARK: 'cdohighcontrastdark',
  PROTANOPIA: 'cdoprotanopia',
  PROTANOPIA_DARK: 'cdoprotanopiadark',
  DEUTERANOPIA: 'cdodeuteranopia',
  DEUTERANOPIA_DARK: 'cdodeuteranopiadark',
  TRITANOPIA: 'cdotritanopia',
  TRITANOPIA_DARK: 'cdotritanopiadark',
};

export const Renderers = {
  GERAS: 'cdo_renderer_geras',
  THRASOS: 'cdo_renderer_thrasos',
  ZELOS: 'cdo_renderer_zelos',
  DEFAULT: 'cdo_renderer_thrasos',
};

// Used for custom field type ClampedNumber(,)
// Captures two optional arguments from the type string
// Allows:
//   ClampedNumber(x,y)
//   ClampedNumber( x , y )
//   ClampedNumber(,y)
//   ClampedNumber(x,)
//   ClampedNumber(,)
export const CLAMPED_NUMBER_REGEX =
  /^ClampedNumber\(\s*([\d.]*)\s*,\s*([\d.]*)\s*\)$/;

// Used for custom field type FieldButton for 'play sound' block
export const DEFAULT_SOUND = 'sound://default.mp3';
