import * as utils from '../utils';
import {
  ICON_PREFIX,
  ICON_PREFIX_REGEX,
  DATA_URL_PREFIX_REGEX,
  ABSOLUTE_REGEXP
} from '../assetManagement/assetPrefix';

export {ICON_PREFIX, ICON_PREFIX_REGEX, DATA_URL_PREFIX_REGEX, ABSOLUTE_REGEXP};
export const FOOTER_HEIGHT = 30;
export const APP_WIDTH = 320;
export const WIDGET_WIDTH = 600;
export const APP_HEIGHT = 480;
export const DESIGN_ELEMENT_ID_PREFIX = 'design_';
export const NEW_SCREEN = 'New screen...';
export const ApplabInterfaceMode = utils.makeEnum('CODE', 'DESIGN', 'DATA');
export const ANIMATION_LENGTH_MS = 200;
export const IMPORT_SCREEN = 'Import screen...';

// Number of ticks after which to capture a thumbnail image of the play space.
// 300 ticks equates to approximately 1-1.5 seconds in apps that become idle
// after the first few ticks, or 10-15 seconds in apps that draw constantly.
export const CAPTURE_TICK_COUNT = 300;

export const defaultFontSizeStyle = '14px';

export const DEFAULT_THEME_INDEX = 0;
export const CLASSIC_THEME_INDEX = 1;

export const themeOptions = [
  'default',
  'classic',
  'orange',
  'citrus',
  'ketchupAndMustard',
  'lemonade',
  'forest',
  'watermelon',
  'area51',
  'polar',
  'glowInTheDark',
  'bubblegum',
  'millennial',
  'robot'
];

export const themeDisplayNames = [
  'Default',
  'Classic',
  'Orange',
  'Citrus',
  'Ketchup and Mustard',
  'Lemonade',
  'Forest',
  'Watermelon',
  'Area 51',
  'Polar',
  'Glow in the Dark',
  'Bubblegum',
  'Millennial',
  'Robot'
];

if (themeOptions.length !== themeDisplayNames.length) {
  throw new Error('themeOptions length must equal themeDisplayNames length');
}

export const fontFamilyOptions = [
  'Arial',
  'Georgia',
  'Palatino',
  'Times',
  'Courier',
  'Lucida Console',
  'Arial Black',
  'Comic',
  'Impact',
  'Lucida Sans',
  'Tahoma',
  'Trebuchet',
  'Verdana'
];

export const fontFamilyStyles = [
  'Arial, Helvetica, sans-serif',
  'Georgia, serif',
  '"Palatino Linotype", "Book Antiqua", Palatino, serif',
  '"Times New Roman", Times, serif',
  '"Courier New", Courier, monospace',
  '"Lucida Console", Monaco, monospace',
  '"Arial Black", Gadget, sans-serif',
  '"Comic Sans MS", cursive, sans-serif',
  'Impact, Charcoal, sans-serif',
  '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
  'Tahoma, Geneva, sans-serif',
  '"Trebuchet MS", Helvetica, sans-serif',
  'Verdana, Geneva, sans-serif'
];

if (fontFamilyOptions.length !== fontFamilyStyles.length) {
  throw new Error(
    'fontFamilyOptions length must equal fontFamilyStyles length'
  );
}
