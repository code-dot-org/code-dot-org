import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const SET_SYSTEM_PROMPT_BLOCK_TYPE = 'spritelab2_setSystemPrompt';

const definition: BlockJson = {
  type: SET_SYSTEM_PROMPT_BLOCK_TYPE,
  message0: 'set system prompt to %1',
  args0: [{type: 'input_value', name: 'PROMPT', check: 'String'}],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Tell the AI how to answer, like "Talk like a pirate." Every ask AI ' +
    'block that runs after this one uses it.',
};

const generator: GeneratorFunction = (block, javascript) => {
  const prompt = javascript.valueToCode(block, 'PROMPT', Order.NONE) || "''";
  return `setSystemPrompt(${prompt});\n`;
};

export default {definition, generator};
