import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {noteImageFieldValue} from '../../imageReferences';
import {FIELD_COSTUME_TYPE} from '../imagePickerFields';
import {FIELD_TRAIT_NAME_TYPE} from '../traitFields';

export const TRAIT_OF_BLOCK_TYPE = 'spritelab2_traitOfSprite';

// Resolves the same way the prediction does: the sprite's own value first,
// then its costume's. Showing one on the stage is how a student checks that.
const definition: BlockJson = {
  type: TRAIT_OF_BLOCK_TYPE,
  message0: '%1 of %2',
  args0: [
    {type: FIELD_TRAIT_NAME_TYPE, name: 'TRAIT'},
    {type: FIELD_COSTUME_TYPE, name: 'ANIMATION_NAME'},
  ],
  inputsInline: true,
  output: 'String',
  style: BlockStyles.LAB_BLOCKS,
};

const generator: GeneratorFunction = block => [
  `traitOfSprite({costume: ${noteImageFieldValue(
    block.getFieldValue('ANIMATION_NAME')
  )}}, ${JSON.stringify(block.getFieldValue('TRAIT'))})`,
  Order.FUNCTION_CALL,
];

export default {definition, generator};
