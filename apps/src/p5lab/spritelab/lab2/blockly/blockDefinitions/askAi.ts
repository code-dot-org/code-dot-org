import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const ASK_AI_BLOCK_TYPE = 'spritelab2_askAI';

/**
 * Send a question to a language model and put the answer in a variable.
 * The answer takes a second or more to arrive, so the variable stays empty
 * until it does; the "when AI answers" hat is how a program waits for it.
 */
const definition: BlockJson = {
  type: ASK_AI_BLOCK_TYPE,
  message0: 'ask AI %1 and put the answer in %2',
  args0: [
    {type: 'input_value', name: 'PROMPT', check: 'String'},
    // No type check: a variables_get block reports no output type.
    {type: 'input_value', name: 'VAR'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Ask the AI a question. The answer arrives a moment later, so use the ' +
    '"when AI answers" block to do something with it.',
};

// The variable socket yields a setter rather than a value, the way the
// classic prompt block does: askAI fills it in once the answer lands.
const generator: GeneratorFunction = (block, javascript) => {
  const target = block.getInput('VAR')?.connection?.targetBlock();
  if (!target || target.type !== 'variables_get') {
    return '';
  }
  const varName = javascript.blockToCode(target)[0];
  const prompt = javascript.valueToCode(block, 'PROMPT', Order.NONE) || "''";
  return `askAI(${prompt}, '${varName}', function (val) {${varName} = val;});\n`;
};

export default {definition, generator};
