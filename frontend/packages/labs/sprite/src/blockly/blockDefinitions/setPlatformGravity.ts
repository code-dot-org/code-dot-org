import {PLATFORM_GRAVITY} from '../../platformPhysics';
import {BlockStyles} from '../constants';
import {type BlockJson, type GeneratorFunction} from '../types';

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
  previousStatement: true,
  nextStatement: true,
  style: BlockStyles.SPRITE,
};

const generator: GeneratorFunction = block =>
  `setPlatformGravity(${Number(block.getFieldValue('GRAVITY'))});\n`;

export default {definition, generator};
