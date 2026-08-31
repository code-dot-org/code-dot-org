import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';
import {APP_WIDTH} from '@cdo/apps/p5lab/constants';

const definition: BlockJson = {
  type: 'spritelab2_patrollingOnBlocks',
  message0: 'patrolling left and right on blocks',
  output: 'Behavior',
  style: BlockStyles.BEHAVIOR,
};

const generator: GeneratorFunction = () => [
  'patrollingOnBlocks()',
  Order.FUNCTION_CALL,
];

// Ticks a patroller stands at each turn before setting off the other way:
// about a quarter of a second, enough to read as looking around.
export const TURN_PAUSE_TICKS = 8;

// Walk left/right along the blocks, standing a moment at each turn: at a
// gap or edge (a point probe under the leading foot, which sees a gap
// narrower than the sprite), at the playspace bounds, or when blocked (x
// differs from where last tick left it). Gravity and footing come from the
// platform resolver, so the walk is the same whichever way is down.
const helperCode = [
  'function patrollingOnBlocks() {',
  '  return {',
  '    func: function (spriteId) {',
  '      var speed = 2;',
  '      usePlatformBody(spriteId);',
  // 'scale' is the on-screen size in pixels; 'width' would be the costume's
  // own unscaled width.
  "      var size = getProp(spriteId, 'scale');",
  '      var half = size > 0 ? size / 2 : 20;',
  "      if (getProp(spriteId, 'patrolOBDir') == undefined) {",
  "        setProp(spriteId, 'patrolOBDir', 1);",
  '      }',
  "      var dir = getProp(spriteId, 'patrolOBDir');",
  '      var turn = function (newDir) {',
  "        setProp(spriteId, 'patrolOBDir', newDir);",
  `        setProp(spriteId, 'patrolOBPause', ${TURN_PAUSE_TICKS});`,
  '      };',
  '      if (!platformGrounded(spriteId)) {',
  '        // Falling: wait for the landing, and do not read where it lands',
  '        // as having been blocked. -1 marks the expected x unknown; the',
  '        // real setProp ignores undefined.',
  "        setProp(spriteId, 'patrolOBExpX', -1);",
  '        return;',
  '      }',
  "      var pause = getProp(spriteId, 'patrolOBPause') || 0;",
  "      var expected = getProp(spriteId, 'patrolOBExpX');",
  '      var blocked =',
  '        expected != undefined &&',
  '        expected >= 0 &&',
  "        getProp(spriteId, 'x') !== expected;",
  '      if (pause > 0) {',
  "        setProp(spriteId, 'patrolOBPause', pause - 1);",
  '      } else if (blocked) {',
  '        turn(-dir);',
  '      } else {',
  "        changePropBy(spriteId, 'x', speed * dir);",
  '        if (!platformSupportAhead(spriteId, dir)) {',
  "          changePropBy(spriteId, 'x', -speed * dir);",
  '          turn(-dir);',
  '        }',
  "        var x = getProp(spriteId, 'x');",
  '        if (x <= half && dir < 0) {',
  '          turn(1);',
  '        }',
  `        if (x >= ${APP_WIDTH} - half && dir > 0) {`,
  '          turn(-1);',
  '        }',
  '      }',
  "      setProp(spriteId, 'patrolOBExpX', getProp(spriteId, 'x'));",
  '    },',
  "    name: 'patrolling on blocks',",
  '  };',
  '}',
].join('\n');

export default {definition, generator, helperCode};
