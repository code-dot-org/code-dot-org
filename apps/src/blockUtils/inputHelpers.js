import {
  DROPDOWN_INPUT,
  DUMMY_INPUT,
  FIELD_INPUT,
  INLINE_DUMMY_INPUT,
  STATEMENT_INPUT,
  VALUE_INPUT,
  VARIABLE_INPUT,
} from './constants';
import STANDARD_INPUT_TYPES from './standardInputTypes';

/**
 * @typedef {Object} InputConfig
 * @property {string} name Input name, conventionally all-caps
 * @property {string[][]|Function} options For dropdowns, the list of options.
 *   Each entry is a 2-element string array with the display name first, and the
 *   codegen-compatible value second (i.e. strings should be doubly-quoted).
 *   Also accepts a zero-argument function to generate these options.
 * @property {Blockly.BlockValueType} type For value inputs, the type required.
 *   Use Blockly.BlockValueType.NONE to accept any block.
 * @property {boolean} statement Indicates that an input is a statement input,
 *   which is passed as a callback function.
 * @property {string} customInput Use the customInput type under this name to
 *   add this input to the block.
 * @property {boolean} field Indicates that an input is a field input, i.e. a
 *   textbox. The generated code will be wrapped in quotes if the arg has type
 *   "String".
 * @property {boolean} dummy Indicates that an input should be a dummy input, i.e. does
 * not render a connection or generate code. Useful as a line break or to add an
 * image to a block.
 * @property {boolean} assignment Indicates that this block should generate
 *   an assignment statement, with this input yielding the variable name.
 * @property {boolean} defer Indicates that this input should be wrapped in a
 *   function before being passed into func, so that evaluation can be deferred
 *   until later.
 * @property {boolean} variableInput Indicates that an input is a variable. The block
 *   will have a dropown selector populated with all the variables in the program.
 *   The generated code will be the variable, which will be defined as a global variable in the program.
 */

/**
 * @typedef {Object} LabeledInputConfig
 * @augments InputConfig
 * @property {string} mode Name of the input type used for this input, either a
 *   key from STANDARD_INPUT_TYPES or one defined as a customInputType.
 * @property {string} label Text to display to the left of the input.
 */

/**
 * Definition of an input type. Must have either addInputRow or addInput
 * defined, but not both.
 *
 * @typedef {Object} InputType
 * @property {?function(Blockly, Blockly.Block, InputConfig): Blockly.Input} addInputRow
 *   Adds a potentially line-ending input to the provided block and returns the
 *   new input.
 * @property {?function(Blockly, Blockly.Block, InputConfig, Blockly.Input)} addInput
 *   Adds an inline input by appending fields or titles to the provided input
 * @property {function(Blockly.Block, InputConfig): string} generateCode
 *   Return the code to be inserted as an argument to the function call
 *   generated for the give block.
 */

/**
 * Splits a blockText into labelled inputs, each match will a label followed by
 * an input. The label is an arbitrary (possibly empty) string. The input is
 * either a real named input like '{VALUE}', a newline, or if it matched a
 * trailing label, nothing.
 */
const LABELED_INPUTS_REGEX = /.*?({[^}]*}|\n|$)/gm;

/**
 * Splits a labeled input into its parts. The resulting groups are:
 * 1: the label
 * 2: the input (a named input like '{VALUE}', a newline, or nothing)
 * 3: the input's name (e.g. 'VALUE')
 */
const LABELED_INPUT_PARTS_REGEX = /(.*?)({([^}]*)}|\n|$)/m;

/**
 * Given block text with input names specified in curly braces, returns a list
 * of labeled inputs that should be added to the block.
 *
 * @param {string} text The complete message shown on the block with inputs in
 *   curly braces, e.g. "Move the {SPRITE} {PIXELS} to the {DIR}"
 * @param {InputConfig[]} args Define the type/options of the block's inputs.
 * @params {string[]} strictTypes Input/output types that are always configerd
 *   with strict type checking.
 *
 * @returns {LabeledInputConfig[]} a list of labeled inputs
 */
export const determineInputs = function (text, args, strictTypes = []) {
  const tokens = text.match(LABELED_INPUTS_REGEX);
  if (tokens.length && tokens[tokens.length - 1] === '') {
    tokens.pop();
  }
  const inputs = tokens.map(token => {
    const parts = token.match(LABELED_INPUT_PARTS_REGEX);
    const label = parts[1];
    const inputName = parts[3];
    if (inputName) {
      const arg = findAndRemoveInputConfig(args, inputName);
      const strict = arg.strict || strictTypes.includes(arg.type);
      let mode;
      if (arg.options) {
        mode = DROPDOWN_INPUT;
      } else if (arg.field) {
        mode = FIELD_INPUT;
      } else if (arg.customInput) {
        mode = arg.customInput;
      } else if (arg.statement) {
        mode = STATEMENT_INPUT;
      } else if (arg.dummy) {
        mode = arg.inline ? INLINE_DUMMY_INPUT : DUMMY_INPUT;
      } else if (arg.variableInput) {
        mode = VARIABLE_INPUT;
      } else {
        mode = VALUE_INPUT;
      }
      const labeledInput = {
        name: arg.name,
        mode,
        label,
        strict,
        type: arg.type,
        options: arg.options,
        assignment: arg.assignment,
        defer: arg.defer,
        customOptions: arg.customOptions,
      };
      Object.keys(labeledInput).forEach(key => {
        if (labeledInput[key] === undefined) {
          delete labeledInput[key];
        }
      });
      return labeledInput;
    } else {
      return {
        mode: DUMMY_INPUT,
        label,
      };
    }
  });
  const statementInputs = args
    .filter(arg => arg.statement)
    .map(arg => ({
      mode: STATEMENT_INPUT,
      name: arg.name,
    }));
  inputs.push(...statementInputs);
  args = args.filter(arg => !arg.statement);

  if (args.length > 0) {
    console.warn('Unexpected args in block definition:');
    console.warn(args);
  }
  return inputs;
};

export const groupInputsByRow = function (
  inputs,
  inputTypes = STANDARD_INPUT_TYPES
) {
  const inputRows = [];
  let lastGroup = [];
  inputRows.push(lastGroup);
  inputs.forEach(input => {
    lastGroup.push(input);
    if (inputTypes[input.mode].addInputRow) {
      lastGroup = [];
      inputRows.push(lastGroup);
    }
  });
  const lastRow = inputRows[inputRows.length - 1];
  if (inputRows[inputRows.length - 1].length) {
    lastRow.push({mode: DUMMY_INPUT});
  } else {
    inputRows.pop();
  }
  return inputRows;
};

/**
 * Adds the specified inputs to the block
 * @param {Blockly} blockly The Blockly object provided to install()
 * @param {Block} block The block to add the inputs to
 * @param {LabeledInputConfig[][]} inputs The list of inputs to interpolate,
 *   grouped by row.
 * @param {Object.<string, InputType>} inputTypes A map of input type names to
 *   their definitions,
 * @param {boolean} inline Whether inputs are being rendered inline
 */
export const interpolateInputs = function (
  blockly,
  block,
  inputRows,
  inputTypes = STANDARD_INPUT_TYPES,
  inline
) {
  inputRows.forEach(inputRow => {
    // Create the last input in the row first
    const lastInputConfig = inputRow[inputRow.length - 1];
    const lastInput = inputTypes[lastInputConfig.mode].addInputRow(
      blockly,
      block,
      lastInputConfig
    );

    // Append the rest of the inputs onto that
    inputRow.slice(0, -1).forEach(inputConfig => {
      inputTypes[inputConfig.mode].addInput(
        blockly,
        block,
        inputConfig,
        lastInput
      );
    });

    // Finally append the last input's label
    lastInput.appendField(lastInputConfig.label);
  });
};

/**
 * Finds the input config for the given input name, and removes it from args.
 * @param {InputConfig[]} args List of configs to search through
 * @param {string} inputName name of input to find and remove
 * @returns InputConfig the input config with name `inputName`
 */
const findAndRemoveInputConfig = (args, inputName) => {
  const argIndex = args.findIndex(arg => arg.name === inputName);
  if (argIndex !== -1) {
    return args.splice(argIndex, 1)[0];
  }
  throw new Error(`${inputName} not found in args`);
};
