import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const ASK_AI_BLOCK_TYPE = 'spritelab2_askAi';

/** Sends text to the AI and runs its blocks when the answer comes back,
    with "AI answer" holding it. The game keeps running meanwhile. */
const definition: BlockJson = {
  type: ASK_AI_BLOCK_TYPE,
  message0: 'ask AI %1 %2 %3',
  args0: [
    {type: 'input_value', name: 'TEXT', check: 'String'},
    {type: 'input_dummy', name: 'ROW'},
    {type: 'input_statement', name: 'DO'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Sends the text to the AI. When its answer arrives, the blocks inside ' +
    'run, and "AI answer" holds what it said.',
};

const generator: GeneratorFunction = (block, generator) => {
  const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  return `askAi(${text}, function () {\n${generator.statementToCode(
    block,
    'DO'
  )}});\n`;
};

export default {definition, generator};
