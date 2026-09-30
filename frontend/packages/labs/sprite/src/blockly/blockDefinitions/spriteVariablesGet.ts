import {Order} from 'blockly/javascript';

import {BlockStyles} from '../constants';
import {type BlockJson, type GeneratorFunction} from '../types';

// Apps' Sprite Lab type; saved projects name it.
export const SPRITE_VARIABLES_GET_BLOCK_TYPE = 'sprite_variables_get';

const definition: BlockJson = {
  type: SPRITE_VARIABLES_GET_BLOCK_TYPE,
  message0: '%1',
  args0: [
    {
      type: 'field_variable',
      name: 'VAR',
      variable: 'item',
      variableTypes: ['Sprite'],
      defaultType: 'Sprite',
    },
  ],
  output: 'Sprite',
  style: BlockStyles.SPRITE,
  helpUrl: '/docs/spritelab/codestudio_spriteName',
  tooltip: 'Returns the value of this variable.',
};

// The sprite the variable names, as the pool's sprite pickers pass one.
const generator: GeneratorFunction = (block, generator) => [
  `{name: '${generator.getVariableName(block.getFieldValue('VAR'))}'}`,
  Order.ATOMIC,
];

export default {definition, generator};
