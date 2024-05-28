import {
  ICON_PREFIX,
  ICON_PREFIX_REGEX,
  DATA_URL_PREFIX_REGEX,
  ABSOLUTE_REGEXP,
} from '../assetManagement/assetPrefix';
import * as utils from '../utils';

export {ICON_PREFIX, ICON_PREFIX_REGEX, DATA_URL_PREFIX_REGEX, ABSOLUTE_REGEXP};
export const FOOTER_HEIGHT = 30;
export const APP_WIDTH = 320;
export const WIDGET_WIDTH = 600; // Note: This constant is also maintained in applab/style.scss.
export const getAppWidth = config =>
  config?.widgetMode ? WIDGET_WIDTH : APP_WIDTH;
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
  'robot',
  'coralReef',
  'mintChip',
  'lavender',
  'cherryVanilla',
  'berryPatch',
  'cucumber',
  'crushedVelvet',
  'playtime',
  'underTheSea',
  'blueAndGold',
  'blueSteel',
  'darkscheme',
  'twoTone',
  'pastel',
  'peachy',
];

const THEME_ICON_BASE_URL = '/blockly/media/applab/theme_dropdown/';

export const themeOptionsForSelect = [
  {
    option: 'default',
    icon: THEME_ICON_BASE_URL + 'default.png',
  },
  {
    option: 'classic',
    icon: THEME_ICON_BASE_URL + 'classic.png',
  },
  {
    option: 'orange',
    icon: THEME_ICON_BASE_URL + 'orange.png',
  },
  {
    option: 'citrus',
    icon: THEME_ICON_BASE_URL + 'citrus.png',
  },
  {
    option: 'ketchupAndMustard',
    icon: THEME_ICON_BASE_URL + 'ketchup_and_mustard.png',
  },
  {
    option: 'lemonade',
    icon: THEME_ICON_BASE_URL + 'lemonade.png',
  },
  {
    option: 'forest',
    icon: THEME_ICON_BASE_URL + 'forest.png',
  },
  {
    option: 'watermelon',
    icon: THEME_ICON_BASE_URL + 'watermelon.png',
  },
  {
    option: 'area51',
    icon: THEME_ICON_BASE_URL + 'area_51.png',
  },
  {
    option: 'polar',
    icon: THEME_ICON_BASE_URL + 'polar.png',
  },
  {
    option: 'glowInTheDark',
    icon: THEME_ICON_BASE_URL + 'glow_in_the_dark.png',
  },
  {
    option: 'bubblegum',
    icon: THEME_ICON_BASE_URL + 'bubblegum.png',
  },
  {
    option: 'millennial',
    icon: THEME_ICON_BASE_URL + 'millennial.png',
  },
  {
    option: 'robot',
    icon: THEME_ICON_BASE_URL + 'robot.png',
  },
  {
    option: 'coralReef',
    icon: THEME_ICON_BASE_URL + 'coral_reef.png',
  },
  {
    option: 'mintChip',
    icon: THEME_ICON_BASE_URL + 'mint_chip.png',
  },
  {
    option: 'lavender',
    icon: THEME_ICON_BASE_URL + 'lavender.png',
  },
  {
    option: 'cherryVanilla',
    icon: THEME_ICON_BASE_URL + 'cherry_vanilla.png',
  },
  {
    option: 'berryPatch',
    icon: THEME_ICON_BASE_URL + 'berry_patch.png',
  },
  {
    option: 'cucumber',
    icon: THEME_ICON_BASE_URL + 'cucumber.png',
  },
  {
    option: 'crushedVelvet',
    icon: THEME_ICON_BASE_URL + 'crushed_velvet.png',
  },
  {
    option: 'playtime',
    icon: THEME_ICON_BASE_URL + 'playtime.png',
  },
  {
    option: 'underTheSea',
    icon: THEME_ICON_BASE_URL + 'under_the_sea.png',
  },
  {
    option: 'blueAndGold',
    icon: THEME_ICON_BASE_URL + 'blue_and_gold.png',
  },
  {
    option: 'blueSteel',
    icon: THEME_ICON_BASE_URL + 'blue_steel.png',
  },
  {
    option: 'darkscheme',
    icon: THEME_ICON_BASE_URL + 'darkscheme.png',
  },
  {
    option: 'twoTone',
    icon: THEME_ICON_BASE_URL + 'two_tone.png',
  },
  {
    option: 'pastel',
    icon: THEME_ICON_BASE_URL + 'pastel.png',
  },
  {
    option: 'peachy',
    icon: THEME_ICON_BASE_URL + 'peachy.png',
  },
];

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
  'Verdana',
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
  'Verdana, Geneva, sans-serif',
];

if (fontFamilyOptions.length !== fontFamilyStyles.length) {
  throw new Error(
    'fontFamilyOptions length must equal fontFamilyStyles length'
  );
}
