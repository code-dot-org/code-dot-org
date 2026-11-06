import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const PLATFORM_GRAVITY_DIRECTION_BLOCK_TYPE =
  'spritelab2_setPlatformGravityDirection';

const definition: BlockJson = {
  type: PLATFORM_GRAVITY_DIRECTION_BLOCK_TYPE,
  message0: 'set gravity direction %1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'DIRECTION',
      options: [
        ['↓', 'down'],
        ['↑', 'up'],
      ],
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
};

const generator: GeneratorFunction = block =>
  `setPlatformGravityDirection(${JSON.stringify(
    block.getFieldValue('DIRECTION')
  )});\n`;

export default {definition, generator};
