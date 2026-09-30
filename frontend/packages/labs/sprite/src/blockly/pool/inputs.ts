// Laying out a pool block's inputs from its blockText, as apps'
// block_utils did.
import type {InputType, LabeledInput, PoolArg} from './types';

export const DROPDOWN_INPUT = 'dropdown';
export const VALUE_INPUT = 'value';
export const INLINE_DUMMY_INPUT = 'inlineDummy';
export const DUMMY_INPUT = 'dummy';
export const STATEMENT_INPUT = 'statement';
export const FIELD_INPUT = 'field';
export const VARIABLE_INPUT = 'variable';

// Splits blockText into labelled inputs: a label, then '{NAME}', a newline,
// or nothing after a trailing label.
const LABELED_INPUTS_REGEX = /.*?({[^}]*}|\n|$)/gm;
// 1: the label; 2: the input; 3: the input's name.
const LABELED_INPUT_PARTS_REGEX = /(.*?)({([^}]*)}|\n|$)/m;

/**
 * Removes and returns the arg named `inputName`; a missing name takes the
 * first remaining arg, on the assumption that args follow the text's order.
 */
function findAndRemoveInputConfig(
  args: PoolArg[],
  inputName: string,
  blockText: string,
): PoolArg | null {
  if (args.length === 0) {
    console.warn(
      `BLOCK_MISSING_INPUT: ${inputName} not found in args. No args remaining. (${blockText})`,
    );
    return null;
  }
  let index = args.findIndex(arg => arg.name === inputName);
  if (index === -1) {
    index = 0;
    console.warn(
      `BLOCK_MISSING_INPUT: ${inputName} not found in args. Defaulting to ${args[index].name}. (${blockText})`,
    );
  }
  return args.splice(index, 1)[0];
}

/**
 * The inputs a block shows, from its text with input names in braces, e.g.
 * "move {SPRITE} {PIXELS} pixels". `args` is consumed. Statement inputs the
 * text does not name go last.
 */
export function determineInputs(
  text: string,
  args: PoolArg[],
  strictTypes: readonly string[] = [],
): LabeledInput[] {
  const tokens = text.match(LABELED_INPUTS_REGEX) ?? [];
  if (tokens.length && tokens[tokens.length - 1] === '') {
    tokens.pop();
  }
  const inputs: LabeledInput[] = tokens.map(token => {
    const parts = token.match(LABELED_INPUT_PARTS_REGEX) as RegExpMatchArray;
    const label = parts[1];
    const inputName = parts[3];
    if (!inputName) {
      return {mode: DUMMY_INPUT, label};
    }
    const arg = findAndRemoveInputConfig(args, inputName, text);
    if (arg === null) {
      return {mode: DUMMY_INPUT, label};
    }
    const strict = arg.strict || strictTypes.includes(arg.type as string);
    let mode: string;
    if (arg.options && !arg.customInput) {
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
    const labeled: LabeledInput = {
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
    for (const key of Object.keys(labeled) as (keyof LabeledInput)[]) {
      if (labeled[key] === undefined) {
        delete labeled[key];
      }
    }
    return labeled;
  });
  inputs.push(
    ...args
      .filter(arg => arg.statement)
      .map(arg => ({mode: STATEMENT_INPUT, name: arg.name})),
  );
  const unused = args.filter(arg => !arg.statement);
  if (unused.length > 0) {
    console.warn(
      `BLOCK_UNEXPECTED_ARGS: ${unused.map(arg => arg.name).join(', ')} (${text})`,
    );
  }
  return inputs;
}

/**
 * Rows of inputs: each row ends with an input that ends a row (a socket, a
 * statement, a line break); a row of fields alone gets a dummy input.
 */
export function groupInputsByRow(
  inputs: LabeledInput[],
  inputTypes: Record<string, InputType>,
): LabeledInput[][] {
  const rows: LabeledInput[][] = [];
  let last: LabeledInput[] = [];
  rows.push(last);
  for (const input of inputs) {
    last.push(input);
    if (inputTypes[input.mode].addInputRow) {
      last = [];
      rows.push(last);
    }
  }
  const lastRow = rows[rows.length - 1];
  if (lastRow.length) {
    lastRow.push({mode: DUMMY_INPUT});
  } else {
    rows.pop();
  }
  return rows;
}
