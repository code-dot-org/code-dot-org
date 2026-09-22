import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const ASK_AI_BLOCK_TYPE = 'spritelab2_askAi';

// Shaped like the predict block, for the same reason: the answer is a
// network round trip, so it is read inside, once it has landed.
const definition: BlockJson = {
  type: ASK_AI_BLOCK_TYPE,
  message0: 'ask AI %1 then %2',
  args0: [
    {type: 'input_value', name: 'QUESTION', check: ['String', 'Number']},
    {type: 'input_statement', name: 'DO'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.LAB_BLOCKS,
  tooltip:
    'Sends the words to an AI and runs the blocks inside when it answers. ' +
    'Read the answer with "AI answer".',
};

const generator: GeneratorFunction = (block, generatorInstance) =>
  `askAi(${
    generatorInstance.valueToCode(block, 'QUESTION', Order.COMMA) || "''"
  }, function () {\n${generatorInstance.statementToCode(block, 'DO')}});\n`;

export default {definition, generator};
