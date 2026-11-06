import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {PLATFORM_GRAVITY} from '../../platformPhysics';

const MIN_GRAVITY_STRENGTH = 0;
const MAX_GRAVITY_STRENGTH = 10;
const DEFAULT_GRAVITY_STRENGTH = 5;

/**
 * Override the platformer's gravity. Zero turns gravity off. Direction is
 * expressed by a separate block-facing control.
 */
const definition: BlockJson = {
  type: 'spritelab2_setPlatformGravity',
  message0: 'set gravity to %1',
  args0: [
    {
      type: 'field_number',
      name: 'GRAVITY',
      value: DEFAULT_GRAVITY_STRENGTH,
      min: MIN_GRAVITY_STRENGTH,
      max: MAX_GRAVITY_STRENGTH,
      precision: 1,
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
};

const generator: GeneratorFunction = block => {
  const gravityStrength = Number(block.getFieldValue('GRAVITY'));
  const engineGravity =
    (gravityStrength / DEFAULT_GRAVITY_STRENGTH) * PLATFORM_GRAVITY;

  return `setPlatformGravity(${engineGravity});\n`;
};

export default {definition, generator};
