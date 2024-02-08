import {globalFunctions} from './dropletUtilsGlobalFunctions';

/**
 * @typedef DropletBlock
 * @description Definition of a block to be used in Droplet
 * @property {string} func identifying the function this block runs
 * @property {string} blockPrefix Prepend this string before the normal block name in the palette
 * @property {Object} parent object within which this function is defined as a property, keyed by the func name
 * @property {String} category category within which to place the block
 * @property {String} color block color, overriding category and type if present
 * @property {String} type type of the block (e.g. value, either, property, readonlyproperty)
 * @property {Object[]} dropdown array of dropdown info for arguments (see Droplet docs)
 * @property {Object|string[]|Function} objectDropdown dropdown info for object on the left side of member expression (assumes wildcard in name)
 * @property {string[]} paletteParams
 * @property {string[]} params
 * @property {Object.<number, function>} dropdown
 * @property {Object.<number, function>} assetTooltip
 * @property {bool} dontMarshal API expects params in interpreter form and will return an interpreter value
 * @property {bool} noAutocomplete Do not include this function in our ace completer
 * @property {bool} nativeIsAsync The native function is internally async and will call a callback function to resume the interpreter
 * @property {string} tipPrefix Prepend this string before the tooltip formed from the function name and (optionally) parameters
 * @property {string} docFunc Use the provided func as the key for our documentation.
 * @property {string} modeOptionName Alternate name to be used when generating droplet mode options
 * @property {Object} paramButtons The function block should render with buttons to add or remove parameters if minArgs or maxArgs are populated
 * @property {number} [paramButtons.minArgs] Minimum number of arguments (implies that buttons should appear)
 * @property {number} [paramButtons.maxArgs] Maximum number of arguments (implies that buttons should appear)
 */

/**
 * @type {DropletBlock[]}
 */
export const dropletGlobalConfigBlocks = [
  {
    func: 'getTime',
    parent: globalFunctions,
    category: 'Control',
    type: 'value',
  },
  {
    func: 'randomNumber',
    parent: globalFunctions,
    category: 'Math',
    type: 'value',
    params: ['1', '10'],
  },
  {
    func: 'prompt',
    parent: window,
    category: 'Variables',
    type: 'value',
    params: ['__'],
  },
  {
    func: 'promptNum',
    parent: globalFunctions,
    category: 'Variables',
    type: 'value',
    params: ['__'],
  },
];
