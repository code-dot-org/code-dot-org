import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {noteImageFieldValue} from '../../imageReferences';
import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

export const PREDICTION_OF_BLOCK_TYPE = 'spritelab2_predictionOfSprite';

// Empty until a predict block has answered for this sprite, which is why the
// two blocks are usually nested rather than placed one after the other.
const definition: BlockJson = {
  type: PREDICTION_OF_BLOCK_TYPE,
  message0: 'prediction for %1',
  args0: [{type: FIELD_COSTUME_TYPE, name: 'ANIMATION_NAME'}],
  output: 'String',
  style: BlockStyles.LAB_BLOCKS,
};

const generator: GeneratorFunction = block => [
  `predictionOfSprite({costume: ${noteImageFieldValue(
    block.getFieldValue('ANIMATION_NAME')
  )}})`,
  Order.FUNCTION_CALL,
];

export default {definition, generator};
