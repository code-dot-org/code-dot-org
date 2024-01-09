import {makeEnum} from '@cdo/apps/utils';
import {parseElement as parseXmlElement} from '../xml';

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
export const DEFAULT_SOUND = 'sound://category_digital/ping.mp3';

export const NO_OPTIONS_MESSAGE = 'uninitialized';
export const EMPTY_OPTION = '???';
export const WORKSPACE_PADDING = 16;

export function stringIsXml(str) {
  try {
    JSON.parse(str);
    // If parsed successfully, string is json, not xml.
    return false;
  } catch (e) {
    try {
      parseXmlElement(str);
      // If parsed successfully, string is not xml.
      return true;
    } catch (e) {
      console.warn(`Source string ${str} is neither JSON nor XML.`);
      // String is neither JSON or XML. Default to XML if we can't parse.
      return true;
    }
  }
}

export const BLOCK_TYPES = {
  behaviorDefinition: 'behavior_definition',
  danceWhenSetup: 'Dancelab_whenSetup',
  procedureDefinition: 'procedures_defnoreturn',
  whenRun: 'when_run',
  behaviorGet: 'gamelab_behavior_get',
  spriteParameterGet: 'sprite_parameter_get',
  procedureCall: 'procedures_callnoreturn',
};

// A list of block types that are procedure definitions. These are sorted
// first when loading blocks so that we can set up the procedure map
// correctly while using the shareable procedure blocks plugin.
export const PROCEDURE_DEFINITION_TYPES = [
  BLOCK_TYPES.behaviorDefinition,
  BLOCK_TYPES.procedureDefinition,
];

// A list of block types associated with the Run button.
export const SETUP_TYPES = [BLOCK_TYPES.whenRun, BLOCK_TYPES.danceWhenSetup];

// A map of user locales supported by Code.org to locales provided by Google Blockly.
// For more information, see: https://github.com/google/blockly/tree/master/msg/json
export const blocklyLocaleMap = {
  'ar-SA': 'ar',
  'az-AZ': 'az',
  'bg-BG': 'bg',
  'bs-BA': 'bs',
  'ca-ES': 'ca',
  'cs-CZ': 'cs',
  'da-DK': 'da',
  'de-DE': 'de',
  'el-GR': 'el',
  'en-US': 'en',
  'es-ES': 'es',
  'es-MX': 'es',
  'et-EE': 'et',
  'eu-ES': 'eu',
  'fa-IR': 'fa',
  'fi-FI': 'fi',
  'fil-PH': 'en', // English provided as broader alternative for Filipino
  'fr-FR': 'fr',
  'ga-IE': 'en', // English provided as broader alternative for Irish (Gaelic)
  'gl-ES': 'gl',
  'he-IL': 'he',
  'hi-IN': 'hi',
  'hr-HR': 'hr',
  'hu-HU': 'hu',
  'hy-AM': 'hy',
  'id-ID': 'id',
  'is-IS': 'is',
  'it-IT': 'it',
  'ja-JP': 'ja',
  'ka-GE': 'ka',
  'ko-KR': 'ko',
  'kk-KZ': 'ru', // Russian provided as regional alternative for Kazakh
  'km-KH': 'km',
  'ky-KG': 'ky',
  'lt-LT': 'lt',
  'lv-LV': 'lv',
  'mi-NZ': 'en', // English provided as broader alternative for Maori
  'mn-MN': 'ru', // Russian provided as regional alternative for Mongolian
  'mr-IN': 'hi', // Hindi provided as regional alternative for Marathi
  'my-MM': 'my',
  'nl-NL': 'nl',
  'nn-NO': 'nb', // Norwegian Bokmål provided as alternative written standard for Norwegian Nynorsk
  'no-NO': 'nb',
  'pl-PL': 'pl',
  'pt-BR': 'pt-br',
  'pt-PT': 'pt',
  'ro-RO': 'ro',
  'ru-RU': 'ru',
  'se-FI': 'nb', // Norwegian Bokmål provided as regional alternative for Northern Sami
  'si-LK': 'si',
  'sk-SK': 'sk',
  'sl-SI': 'sl',
  'sm-WS': 'en', // English provided as broader alternative for Samoan
  'sq-AL': 'sq',
  'sr-SP': 'sr',
  'sv-SE': 'sv',
  'ta-IN': 'ta',
  'te-IN': 'te',
  'th-TH': 'th',
  'tr-TR': 'tr',
  'uk-UA': 'uk',
  'uz-UZ': 'uz',
  'vi-VN': 'vi',
  'zh-CN': 'zh-hans',
  'zh-TW': 'zh-hant',
};
