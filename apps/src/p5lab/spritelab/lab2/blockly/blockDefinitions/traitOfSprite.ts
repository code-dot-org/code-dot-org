import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {FIELD_TRAIT_NAME_TYPE} from '../traitFields';

export const TRAIT_OF_BLOCK_TYPE = 'spritelab2_traitOfSprite';

// Resolves the same way the prediction does: the sprite's own value first,
// then its costume's. Showing one on the stage is how a student checks that.
const definition: BlockJson = {
  type: TRAIT_OF_BLOCK_TYPE,
  message0: '%1 of %2',
  args0: [
    {type: FIELD_TRAIT_NAME_TYPE, name: 'TRAIT'},
    {type: 'input_value', name: 'SPRITE', check: 'Sprite'},
  ],
  inputsInline: true,
  output: 'String',
  style: BlockStyles.LAB_BLOCKS,
};

const generator: GeneratorFunction = (block, generatorInstance) => [
  `traitOfSprite(${
    generatorInstance.valueToCode(block, 'SPRITE', Order.COMMA) || 'null'
  }, ${JSON.stringify(block.getFieldValue('TRAIT'))})`,
  Order.FUNCTION_CALL,
];

export default {definition, generator};
