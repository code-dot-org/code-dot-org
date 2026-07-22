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

// Platform patrol: walk left/right along the 'walls' group, turning at any
// gap or platform edge, at the playspace edge, or when blocked (this tick's x
// differs from where last tick's step left it — a wall collision pushed it
// back). Edges/gaps are found with a hasSupportAt point probe half a grid
// cell ahead of center: a point sees gaps narrower than the sprite, so even a
// cell-wide patroller turns at a one-cell gap instead of bridging it.
// Grounding comes from isDirectlyAbove; zGameDev's collide keeps grounded
// sprites exactly on top of walls, and the playspace floor counts as footing,
// so a floor patroller just walks the bounds. The knife-edge recovery is a
// safety net for a sprite that ends up dropping through a gap's zero-overlap
// seam anyway (e.g. shoved onto it): grounded last tick + airborne now →
// nudge past the seam, back up to the walking line, cancel the fall.
const helperCode = [
  'function patrollingOnBlocks() {',
  '  return {',
  '    func: function (spriteId) {',
  '      var speed = 2;',
  '      var look = 25;',
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
  '      if (x <= 25 && dir < 0) {',
  "        setProp(spriteId, 'patrolOBDir', 1);",
  '      }',
  '      if (x >= 375 && dir > 0) {',
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
