import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const FEATURES_OF_BLOCK_TYPE = 'spritelab2_featuresOfSprite';

// Made for joining into an "ask AI" question, so the generative model sees
// what the prediction model saw.
const definition: BlockJson = {
  type: FEATURES_OF_BLOCK_TYPE,
  message0: 'features of %1',
  args0: [{type: 'input_value', name: 'SPRITE', check: 'Sprite'}],
  inputsInline: true,
  output: 'String',
  style: BlockStyles.LAB_BLOCKS,
  tooltip:
    "All of the sprite's feature values as words, such as " +
    '"Leaf Spots is many, Soil Moisture is wet".',
};

const generator: GeneratorFunction = (block, generatorInstance) => [
  `featuresOfSprite(${
    generatorInstance.valueToCode(block, 'SPRITE', Order.NONE) || 'null'
  })`,
  Order.FUNCTION_CALL,
];

export default {definition, generator};
