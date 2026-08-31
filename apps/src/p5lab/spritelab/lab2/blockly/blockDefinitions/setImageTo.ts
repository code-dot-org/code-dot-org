import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

export const SET_IMAGE_TO_BLOCK_TYPE = 'spritelab2_setImageTo';

/** Give a sprite the image named by a value, such as a model's prediction. */
const definition: BlockJson = {
  type: SET_IMAGE_TO_BLOCK_TYPE,
  message0: 'set %1 image to %2',
  args0: [
    {type: FIELD_COSTUME_TYPE, name: 'ANIMATION_NAME'},
    {type: 'input_value', name: 'IMAGE'},
  ],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
  tooltip: 'Changes the sprite to the image with this name.',
};

const generator: GeneratorFunction = (block, generator) => {
  const image = generator.valueToCode(block, 'IMAGE', Order.NONE) || '""';
  return `setImage({costume: ${block.getFieldValue(
    'ANIMATION_NAME'
  )}}, ${image});\n`;
};

export default {definition, generator};
