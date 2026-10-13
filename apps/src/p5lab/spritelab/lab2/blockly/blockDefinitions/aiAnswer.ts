import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const AI_ANSWER_BLOCK_TYPE = 'spritelab2_aiAnswer';

/** The AI's most recent answer. */
const definition: BlockJson = {
  type: AI_ANSWER_BLOCK_TYPE,
  message0: 'AI answer',
  output: 'String',
  style: BlockStyles.DEFAULT,
  tooltip: 'What the AI said most recently.',
};

const generator: GeneratorFunction = () => ['aiAnswer()', Order.FUNCTION_CALL];

export default {definition, generator};
