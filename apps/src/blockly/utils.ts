import {Block, BlockSvg, WorkspaceSvg} from 'blockly';
import _ from 'lodash';

import {SOUND_PREFIX} from '@cdo/apps/assetManagement/assetPrefix';
import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import {getStore} from '@cdo/apps/redux';
import {setFailedToGenerateCode} from '@cdo/apps/redux/blockly';

import {DARK_THEME_SUFFIX, Themes} from './constants';
import {ExtendedBlock} from './types';

type xmlAttribute = string | null;
type InputTuple = [string, string, number];
type InputCallback = () => void;
type InputArgs = [...(InputTuple | InputCallback)[], number];
type BlockList = Array<Block | BlockSvg>;

// Considers an attribute true only if it is explicitly set to 'true' (i.e. defaults to false if unset).
export const FALSEY_DEFAULT = (attributeValue: xmlAttribute) =>
  attributeValue === 'true';

// Considers an attribute true unless it is explicitly set to 'false' (i.e. defaults to true if unset).
export const TRUTHY_DEFAULT = (attributeValue: xmlAttribute) =>
  attributeValue !== 'false';

/**
 * Reads a boolean attribute from an XML element and determines its value based on a callback function.
 * The callback function determines how we interpret the attribute value as a boolean.
 * @param {Element} xmlElement - The XML element from which to read the attribute.
 * @param {string} attribute - The name of the attribute to read from the XML element.
 * @param {function(string): boolean} [callback=FALSEY_DEFAULT] - A callback function that takes the attribute value as a string and returns a boolean.
 * @returns {boolean} The boolean value of the attribute as determined by the callback function.
 */
export function readBooleanAttribute(
  xmlElement: Element,
  attribute: string,
  callback: (attributeValue: xmlAttribute) => boolean = FALSEY_DEFAULT
) {
  const attributeValue = xmlElement.getAttribute(attribute);
  return callback(attributeValue);
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function parseSoundPathString(text: string) {
  // Example string paths:
  // 'sound://category_board_games/card_dealing_multiple.mp3'
  // 'sound://default.mp3'
  if (!text.startsWith(SOUND_PREFIX) || !text.endsWith('.mp3')) {
    throw new Error('This is not a valid path to a sound file.');
  }
  const pathStringArray = text.split('/');
  let category = '';
  // Some sounds do not include a category, such as default.mp3
  if (pathStringArray[2].includes('category_')) {
    category = pathStringArray[2];
    // Example: 'category_board_games' becomes 'Board games: '
    category = category.replace('category_', '');
    category = category.replace(/_/g, ' ');
    category = capitalizeFirstLetter(category) + ': ';
  }
  // Example: 'card_dealing_multiple.mp3' becomes 'card_dealing_multiple'
  const soundName = pathStringArray[pathStringArray.length - 1].replace(
    '.mp3',
    ''
  );
  // Examples: 'Board games: card_dealing_multiple', 'default'
  const fieldText = `${category}${soundName}`;
  return fieldText;
}

/**
 * Converts a printer-style string range to an array of numbers
 * e.g., "1,2,4-6" becomes [1,2,4,5,6]
 * @param rangeString {string} printer-style range, e.g., "1,2,4-6"
 * @returns  array of numbers
 */
export function printerStyleNumberRangeToList(rangeString: string) {
  const rangeStringNoSpaces = rangeString.replace(/ /g, '');
  const rangeItems = rangeStringNoSpaces.split(',');
  const rangeRegExp = /^(\d+)-(\d+)$/; // e.g., "4-6"
  const numberRegExp = /^(\d+)$/; // e.g., "1", "2"
  const fullNumberList = rangeItems.reduce<number[]>((numberArray, currExp) => {
    const rangeResult = rangeRegExp.exec(currExp);
    const numberResult = numberRegExp.exec(currExp);
    if (rangeResult) {
      const lowerBound = Number(rangeResult[1]);
      const upperNonInclusiveBound = Number(rangeResult[2]) + 1;
      const rangeArray = _.range(lowerBound, upperNonInclusiveBound);
      numberArray = numberArray.concat(rangeArray);
    } else if (numberResult) {
      numberArray.push(Number(numberResult[1]));
    }
    return numberArray;
  }, []);
  return fullNumberList;
}

/**
 * Converts an array of numbers to a string of numbers separated by commas
 * e.g., [1,2,4,5,6] becomes "1,2,4,5,6", [5] becomes "5"
 * @param numberList array of numbers
 * @returns  numberString {string}
 */
export function numberListToString(numberList: number[]) {
  let numberString = numberList.reduce<string>((str, curr) => {
    str = str + curr + ',';
    return str;
  }, '');
  if (numberList.length > 0) {
    numberString = numberString.slice(0, -1);
  }
  return numberString;
}

/**
 * Determines whether the hidden procedure definition workspace should be skipped during serialization.
 * The hidden workspace is a counter-part to the main workspace containing blocks for functions and behaviors.
 *
 * @param {Blockly.WorkspaceSvg} workspace - The workspace to be checked for serialization as hidden.
 * @returns {boolean} Returns `true` if the hidden workspace should be skipped, otherwise `false`.
 */
export function shouldSkipHiddenWorkspace(workspace: WorkspaceSvg) {
  return (
    !Blockly.getHiddenDefinitionWorkspace ||
    Blockly.getMainWorkspace().id !== workspace.id ||
    Blockly.isToolboxMode
  );
}

/**
 * Handle a failure to get workspace code by either CDO or Google Blockly
 * by updating the redux store and logging the error.
 * We only want to log the error once per failure since getWorkspaceCode
 * gets called many times and the error will be the same every time.
 * @param {MetricEvent} eventName Event name to log
 * @param {Error} error Error thrown by getWorkspaceCode
 */
export function handleCodeGenerationFailure(
  eventName: MetricEvent,
  error: Error
) {
  const store = getStore();
  if (!store.getState().blockly.failedToGenerateCode) {
    store.dispatch(setFailedToGenerateCode(true));
    MetricsReporter.logError({
      event: eventName,
      errorMessage: error.message,
      stackTrace: error.stack,
    });
  }
}

// Returns the current theme name without the 'dark' suffix, if present.
export function getBaseName(themeName: Themes) {
  if (themeName) {
    return themeName.replace(DARK_THEME_SUFFIX, '');
  }
}
export const INFINITE_LOOP_TRAP =
  '  executionInfo.checkTimeout(); if (executionInfo.isTerminated()){return;}\n';

export const LOOP_HIGHLIGHT = 'loopHighlight();\n';
const LOOP_HIGHLIGHT_RE = new RegExp(
  LOOP_HIGHLIGHT.replace(/\(.*\)/, '\\(.*\\)') + '\\s*',
  'g'
);

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract the user's code as raw JavaScript.
 * @param {string} code Generated code.
 * @return {string} The code without serial numbers and timeout checks.
 */
export function strip(code: string) {
  return (
    code
      // Strip out serial numbers.
      .replace(/(,\s*)?'block_id_[^']+'\)/g, ')')
      // Remove timeouts.
      .replace(new RegExp(escapeRegExp(INFINITE_LOOP_TRAP), 'g'), '')
      // Strip out loop highlight
      .replace(LOOP_HIGHLIGHT_RE, '')
      // Strip out class namespaces.
      .replace(/(StudioApp|Maze|Turtle)\./g, '')
      // Strip out particular helper functions.
      .replace(/^function (colour_random)[\s\S]*?^}/gm, '')
      // Collapse consecutive blank lines.
      .replace(/\n\n+/gm, '\n\n')
      // Trim.
      .replace(/^\s+|\s+$/g, '')
  );
}

/**
 * Interpolate a message string, creating fields and inputs.
 * @param {string} msg The message string to parse.  %1, %2, etc. are symbols
 *     for value inputs.
 * @param {!Array.<string|number>|number} inputArgs A series of tuples or
 *     callbacks that each specify the value inputs to create.  If a callback
 *     is provided, we defer rendering to that method. Otherwise, each tuple has
 *     three values:
 *       the input name
 *       its check type
 *       its field's alignment.
 *     The last parameter is not a tuple, but just an alignment for any trailing
 *     dummy input.  This last parameter is mandatory; there may be any number
 *     of tuples (though the number of tuples must match the symbols in msg).
 * This was copied and modernized from the original CDO Blockly version:
 * https://github.com/code-dot-org/blockly/blob/v4.1.0/core/ui/block.js#L2632-L2692
 */
export function interpolateMsg(
  this: ExtendedBlock,
  msg: string,
  ...inputArgs: InputArgs
): void {
  // Ensure msg is a string.
  if (typeof msg !== 'string') {
    throw new Error('Assertion failed: msg is not a string');
  }
  // Remove the dummy alignment from the end of args.
  const dummyAlign = inputArgs.pop();
  if (typeof dummyAlign !== 'number') {
    throw new Error('Assertion failed: dummyAlign is not a number');
  }

  const tokens = msg.split(/(%\d)/);
  const usedArgs: boolean[] = new Array(inputArgs.length).fill(false);
  for (let i = 0; i < tokens.length; i += 2) {
    const text = tokens[i].trim();
    const symbol = tokens[i + 1];
    if (symbol) {
      // Value input.
      const digit = parseInt(symbol.charAt(1), 10);
      const inputArg = inputArgs[digit - 1];

      if (typeof inputArg === 'function') {
        this.appendDummyInput().appendField(text);
        inputArg();
      } else if (Array.isArray(inputArg)) {
        this.appendValueInput(inputArg[0])
          .setCheck(inputArg[1])
          .setAlign(inputArg[2])
          .appendField(text);
      }
      usedArgs[digit - 1] = true; // Mark input as used.
    } else if (text) {
      // Trailing dummy input.
      this.appendDummyInput().setAlign(dummyAlign).appendField(text);
    }
  }

  // Verify that all inputs were used.
  const unusedArgIndex = usedArgs.findIndex(used => !used);
  if (unusedArgIndex !== -1) {
    const formattedMessage = `Input "${
      unusedArgIndex + 1
    }" not used in message: "${msg}"`;
    throw new Error(formattedMessage);
  }

  // Make the inputs inline unless there is only one input and no text follows it.
  this.setInputsInline(!msg.match(/%1\s*$/));
}

/**
 * Retrieves the top-level Blockly blocks from the students Blockly workspace and
 * potentially includes the top-level blocks from the hidden definition workspace.
 *
 * @returns {BlockList} An array of the top-level blocks.
 */
export function getCodeBlocks(): BlockList {
  let codeBlocks: BlockList = [];
  let hiddenBlocks: BlockList = [];
  const mainBlocks = Blockly.mainBlockSpace.getTopBlocks(true) as BlockList;

  // The hidden workspace is only present in Google Blockly labs where the modal
  // function editor is enabled.
  if (Blockly.getHiddenDefinitionWorkspace()) {
    hiddenBlocks = Blockly.getHiddenDefinitionWorkspace().getTopBlocks(
      true
    ) as BlockList;
  }

  // Hidden blocks need to be listed first in case they would set the
  // value of global variables.
  codeBlocks = [...hiddenBlocks, ...mainBlocks];

  return codeBlocks;
}

/**
 * Retrieves all Blockly blocks from the student's Blockly workspaces.
 * This is useful for providing the student with feedback about the total
 * number of blocks they have used or added.
 *
 * @returns {BlockList} An array of all blocks.
 */
export function getAllBlocks(): BlockList {
  return [
    ...Blockly.mainBlockSpace.getAllUsedBlocks(),
    ...(Blockly.getHiddenDefinitionWorkspace()
      ? Blockly.getHiddenDefinitionWorkspace().getAllBlocks()
      : []),
  ];
}
