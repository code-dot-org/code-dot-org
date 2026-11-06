import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {PLATFORM_GRAVITY} from '../../platformPhysics';

const MIN_GRAVITY_STRENGTH = 1;
const MAX_GRAVITY_STRENGTH = 10;
const DEFAULT_GRAVITY_STRENGTH = 5;

/** Override the platformer's gravity and direction. */
const definition: BlockJson = {
  type: 'spritelab2_setPlatformGravity',
  message0: 'set gravity to %1 in direction %2',
  args0: [
    {
      type: 'field_slider',
      name: 'GRAVITY',
      value: DEFAULT_GRAVITY_STRENGTH,
      min: MIN_GRAVITY_STRENGTH,
      max: MAX_GRAVITY_STRENGTH,
      precision: 1,
    },
    {
      type: 'field_dropdown',
      name: 'DIRECTION',
      options: [
        ['↓', 'down'],
        ['↑', 'up'],
        ['none', 'none'],
      ],
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

  const direction = JSON.stringify(block.getFieldValue('DIRECTION'));

  return (
    `setPlatformGravity(${engineGravity});\n` +
    `setPlatformGravityDirection(${direction});\n`
  );
};

export default {definition, generator};
