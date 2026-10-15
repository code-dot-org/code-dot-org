import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {PLATFORM_GRAVITY} from '../../platformPhysics';

/**
 * Override the platformer's gravity. Negative flips the world: players fall
 * up and land on block undersides and the view's top edge; the platform
 * player's jump follows the flip. Zero turns gravity off.
 */
const definition: BlockJson = {
  type: 'spritelab2_setPlatformGravity',
  message0: 'set gravity to %1',
  args0: [
    {
      type: 'field_number',
      name: 'GRAVITY',
      value: PLATFORM_GRAVITY,
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
};

const generator: GeneratorFunction = block =>
  `setPlatformGravity(${Number(block.getFieldValue('GRAVITY'))});\n`;

export default {definition, generator};
