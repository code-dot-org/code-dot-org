import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const AI_ANSWER_BLOCK_TYPE = 'spritelab2_aiAnswer';

// Empty until an "ask AI" block has answered in this scene.
const definition: BlockJson = {
  type: AI_ANSWER_BLOCK_TYPE,
  message0: 'AI answer',
  output: 'String',
  style: BlockStyles.LAB_BLOCKS,
};

const generator: GeneratorFunction = () => ['aiAnswer()', Order.FUNCTION_CALL];

export default {definition, generator};
