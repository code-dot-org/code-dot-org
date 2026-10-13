import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const ENTERED_TEXT_BLOCK_TYPE = 'spritelab2_enteredText';

/** The text the player sent most recently. */
const definition: BlockJson = {
  type: ENTERED_TEXT_BLOCK_TYPE,
  message0: 'entered text',
  output: 'String',
  style: BlockStyles.DEFAULT,
  tooltip: 'What the player typed and sent most recently.',
};

const generator: GeneratorFunction = () => [
  'enteredText()',
  Order.FUNCTION_CALL,
];

export default {definition, generator};
