import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

export const DISTANCE_BETWEEN_BLOCK_TYPE = 'spritelab2_distanceBetween';

/** How far apart two sprites are, centre to centre, in playfield units. */
const definition: BlockJson = {
  type: DISTANCE_BETWEEN_BLOCK_TYPE,
  message0: 'distance from %1 to %2',
  args0: [
    {type: FIELD_COSTUME_TYPE, name: 'FROM'},
    {type: FIELD_COSTUME_TYPE, name: 'TO'},
  ],
  output: 'Number',
  style: BlockStyles.MATH,
  tooltip:
    'How far apart the two sprites are, from 0 when they overlap to about ' +
    '400 across the whole playfield.',
};

const generator: GeneratorFunction = block => [
  `distanceBetween({costume: ${block.getFieldValue(
    'FROM'
  )}}, {costume: ${block.getFieldValue('TO')}})`,
  Order.FUNCTION_CALL,
];

export default {definition, generator};
