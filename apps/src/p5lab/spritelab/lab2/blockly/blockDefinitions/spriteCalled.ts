import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const SPRITE_CALLED_BLOCK_TYPE = 'spritelab2_spriteCalled';

// Text and buttons wear no costume, so the costume-based sprite blocks
// cannot reach them; this lets set, move and destroy blocks do so.
const definition: BlockJson = {
  type: SPRITE_CALLED_BLOCK_TYPE,
  message0: 'the sprite called %1',
  args0: [{type: 'field_input', name: 'NAME', text: 'text1'}],
  output: 'Sprite',
  style: BlockStyles.SPRITE,
};

const generator: GeneratorFunction = block => [
  `{name: ${JSON.stringify(block.getFieldValue('NAME'))}}`,
  Order.ATOMIC,
];

export default {definition, generator};
