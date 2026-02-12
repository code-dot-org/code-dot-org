import {ExtendedBlock} from '@cdo/apps/blockly/types';

type InputTuple = [string, string, number];
type InputCallback = () => void;
type InputArgs = [...(InputTuple | InputCallback)[], number];

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
