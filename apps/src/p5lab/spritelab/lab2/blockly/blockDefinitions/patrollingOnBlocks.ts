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

// Walk left/right along the 'walls' group, turning at gaps, edges, the
// playspace bounds, or when blocked (x differs from where last tick left it).
// Gaps are found with a hasSupportAt point probe ahead of center: a point
// sees gaps narrower than the sprite. The knife-edge recovery catches a
// sprite dropping through a gap's zero-overlap seam (grounded last tick,
// airborne now): nudge past the seam, back up, cancel the fall.
const helperCode = [
  'function patrollingOnBlocks() {',
  '  return {',
  '    func: function (spriteId) {',
  '      var speed = 2;',
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
  "      var grounded = isDirectlyAbove(spriteId, {group: 'walls'});",
  "      var expected = getProp(spriteId, 'patrolOBExpX');",
  '      var blocked =',
  "        expected != undefined && getProp(spriteId, 'x') !== expected;",
  "      if (!grounded && getProp(spriteId, 'patrolOBWasG')) {",
  '        // Dropped through a bridged gap’s zero-overlap seam last tick:',
  '        // step past it, back up to the walking line, cancel the fall.',
  "        changePropBy(spriteId, 'x', speed * dir);",
  "        changePropBy(spriteId, 'y', 3);",
  "        setProp(spriteId, 'velocityY', 0);",
  '      }',
  '      if (grounded && blocked) {',
  '        dir = -dir;',
  "        setProp(spriteId, 'patrolOBDir', dir);",
  '      }',
  "      changePropBy(spriteId, 'x', speed * dir);",
  '      if (grounded) {',
  "        var supported = hasSupportAt(spriteId, look * dir, {group: 'walls'});",
  '        if (!supported) {',
  "          changePropBy(spriteId, 'x', -speed * dir);",
  '          dir = -dir;',
  "          setProp(spriteId, 'patrolOBDir', dir);",
  '        }',
  '      }',
  "      var x = getProp(spriteId, 'x');",
  '      if (x <= half && dir < 0) {',
  "        setProp(spriteId, 'patrolOBDir', 1);",
  '      }',
  '      if (x >= 400 - half && dir > 0) {',
  "        setProp(spriteId, 'patrolOBDir', -1);",
  '      }',
  "      setProp(spriteId, 'patrolOBExpX', x);",
  "      setProp(spriteId, 'patrolOBWasG', grounded);",
  '    },',
  "    name: 'patrolling on blocks',",
  '  };',
  '}',
].join('\n');

export default {definition, generator, helperCode};
