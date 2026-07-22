import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

const definition: BlockJson = {
  type: 'spritelab2_movingWithArrowKeys',
  message0: 'moving with arrow keys',
  output: 'Behavior',
  style: BlockStyles.BEHAVIOR,
};

const generator: GeneratorFunction = () => [
  'movingWithArrowKeys()',
  Order.FUNCTION_CALL,
];

// The oceanSetup helper libraries' moving_with_arrow_keys, in this lab's
// behavior-factory shape. Moves at the sprite's own speed property, like the
// classic behavior.
const helperCode = [
  'function movingWithArrowKeys() {',
  '  return {',
  '    func: function (spriteId) {',
  '      if (isKeyPressed("up")) {',
  '        moveInDirection(spriteId, getProp(spriteId, "speed"), "North");',
  '      }',
  '      if (isKeyPressed("down")) {',
  '        moveInDirection(spriteId, getProp(spriteId, "speed"), "South");',
  '      }',
  '      if (isKeyPressed("left")) {',
  '        moveInDirection(spriteId, getProp(spriteId, "speed"), "West");',
  '      }',
  '      if (isKeyPressed("right")) {',
  '        moveInDirection(spriteId, getProp(spriteId, "speed"), "East");',
  '      }',
  '    },',
  "    name: 'moving with arrow keys',",
  '  };',
  '}',
].join('\n');

export default {definition, generator, helperCode};
