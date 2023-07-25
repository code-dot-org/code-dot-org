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
  THRASOS_IRS: 'cdo_renderer_thrasos_irs',
  ZELOS: 'cdo_renderer_zelos',
  // The default renderer includes inline row separators.
  DEFAULT: 'cdo_renderer_thrasos_irs',
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

// A list of block types that are procedure definitions. These are sorted
// first when loading blocks so that we can set up the procedure map
// correctly while using the shareable procedure blocks plugin.
export const procedureDefinitionTypes = ['procedures_defnoreturn'];

// A list of block types that setup types. These are sorted first when
// positioning blocks to that they end up in the expected top-left corner.
export const setupTypes = ['Dancelab_whenSetup', 'when_run'];

/**
 * Helper function to sort blocks (XML elements or blocks) based on the block type.
 *
 * @param {Array} blocks - The array of blocks to be sorted.
 * @param {Array} types - An array of block types used for sorting.
 * @param {boolean} [reverseOrder=false] - If true, sorts the blocks in reverse order.
 * @returns {Array} - The sorted array of blocks.
 */
export function sortBlocksByType(blocks, types, reverseOrder = false) {
  return blocks.sort((a, b) => {
    // Blocks are either objects with a type property or elements with a type attribute.
    const aType = a.type || a.getAttribute('type');
    const bType = b.type || b.getAttribute('type');

    // If both blocks are of specified types, maintain their original order
    if (types.includes(aType) && types.includes(bType)) {
      return 0;
    }

    // If block a is of a specified type, it should come first (unless reversed)
    if (types.includes(aType)) {
      return reverseOrder ? 1 : -1;
    }

    // If block b is of a specified type, it should come first (unless reversed)
    if (types.includes(bType)) {
      return reverseOrder ? -1 : 1;
    }

    // Otherwise, maintain the original order
    return 0;
  });
}
