import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

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
// a third of a second, enough to read as looking around.
export const TURN_PAUSE_TICKS = 10;

// Walk left/right along the blocks, turning at gaps, edges, the playspace
// bounds, or when blocked (x differs from where last tick left it), with a
// short stand at each turn. The sprite is handed to the platform resolver
// (usePlatformBody), which gives it gravity and landings in whichever
// direction gravity points; in the air the behavior waits, and walks again
// on landing. Footing comes from the resolver's own geometry:
// platformGrounded, and platformSupportAhead — a point probe ahead of
// centre, which sees a gap narrower than the sprite.
const helperCode = [
  'function patrollingOnBlocks() {',
  '  return {',
  '    func: function (spriteId) {',
  '      var speed = 2;',
  '      usePlatformBody(spriteId);',
  // Half the sprite's on-screen size: the gap probe sits at its leading edge,
  // whatever the playfield's cell size is. 'scale' is that size in pixels;
  // 'width' is the costume's own unscaled width.
  "      var size = getProp(spriteId, 'scale');",
  '      var half = size > 0 ? size / 2 : 20;',
  '      var look = half;',
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
  '        // as having been blocked.',
  "        setProp(spriteId, 'patrolOBExpX', undefined);",
  '        return;',
  '      }',
  "      var pause = getProp(spriteId, 'patrolOBPause') || 0;",
  "      var expected = getProp(spriteId, 'patrolOBExpX');",
  '      var blocked =',
  "        expected != undefined && getProp(spriteId, 'x') !== expected;",
  '      if (pause > 0) {',
  "        setProp(spriteId, 'patrolOBPause', pause - 1);",
  '      } else if (blocked) {',
  '        turn(-dir);',
  '      } else {',
  "        changePropBy(spriteId, 'x', speed * dir);",
  '        if (!platformSupportAhead(spriteId, look * dir)) {',
  "          changePropBy(spriteId, 'x', -speed * dir);",
  '          turn(-dir);',
  '        }',
  "        var x = getProp(spriteId, 'x');",
  '        if (x <= half && dir < 0) {',
  '          turn(1);',
  '        }',
  '        if (x >= 400 - half && dir > 0) {',
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
