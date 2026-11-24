import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {
  DEFAULT_JUMP_HEIGHT,
  MAX_JUMP_HEIGHT,
  MIN_JUMP_HEIGHT,
} from '../../platformPhysics';

/**
 * Set the platform player's jump height in playfield squares.
 */
const definition: BlockJson = {
  type: 'spritelab2_setPlatformJumpHeight',
  message0: 'set jump height to %1 squares',
  args0: [
    {
      type: 'field_number',
      name: 'HEIGHT',
      value: DEFAULT_JUMP_HEIGHT,
      min: MIN_JUMP_HEIGHT,
      max: MAX_JUMP_HEIGHT,
      precision: 1,
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
};

const generator: GeneratorFunction = block =>
  `setPlatformJumpHeight(${Number(block.getFieldValue('HEIGHT'))});\n`;

export default {definition, generator};
