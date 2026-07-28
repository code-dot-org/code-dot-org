import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

const definition: BlockJson = {
  type: 'spritelab2_patrollingLeftRight',
  message0: 'patrolling left and right',
  output: 'Behavior',
  style: BlockStyles.BEHAVIOR,
};

const generator: GeneratorFunction = () => [
  'patrollingLeftRight()',
  Order.FUNCTION_CALL,
];

// Mirrors NativeSpriteLab's patrollingUpDown, on x. Its own direction
// property, so both patrols can ride one sprite.
const helperCode = [
  'function patrollingLeftRight(spriteId) {',
  '  var behavior = function (spriteId) {',
  "    if (getProp(spriteId, 'patrollingDirectionLR') == undefined) {",
  "      setProp(spriteId, 'patrollingDirectionLR', 'right');",
  '    }',
  "    var direction = getProp(spriteId, 'patrollingDirectionLR');",
  "    if (direction == 'right') {",
  "      changePropBy(spriteId, 'x', 6);",
  '    }',
  "    if (direction == 'left') {",
  "      changePropBy(spriteId, 'x', -6);",
  '    }',
  "    var x = getProp(spriteId, 'x');",
  '    if (x <= 40) {',
  "      setProp(spriteId, 'patrollingDirectionLR', 'right');",
  '    }',
  '    if (x >= 360) {',
  "      setProp(spriteId, 'patrollingDirectionLR', 'left');",
  '    }',
  '  };',
  "  return {func: behavior, name: 'patrollingLeftRight'};",
  '}',
].join('\n');

export default {definition, generator, helperCode};
