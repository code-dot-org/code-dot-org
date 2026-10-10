import {APP_WIDTH} from '@cdo/apps/p5lab/constants';

// The interpreted half of the three walks on blocks the begins block
// offers (beginsBehavior.ts), which carries this source as its helperCode.

// Ticks a walker stands at each turn before setting off the other way:
// about a quarter of a second, enough to read as looking around.
export const TURN_PAUSE_TICKS = 8;

// walkExpX value meaning "no expected x": positions are always positive
// (the resolver clamps sprites inside the view), so -1 can't be one.
export const PATROL_X_UNKNOWN = -1;

// A wanderer stops to look around about this often, in ticks, and for a
// stand of between the two lengths.
export const WANDER_STAND_EVERY = 90;
export const WANDER_STAND_TICKS: [number, number] = [8, 40];

// A follower is close enough to stop within this many pixels of the player.
export const FOLLOW_REACH_PX = 20;

// The walkers on blocks share one step: walk one tick along the blocks in a
// direction (0 stands still), standing a moment at each turn. Gravity and
// footing come from the platform resolver, so the walk is the same whichever
// way is down. The step reports what stopped it: a gap or edge (a point
// probe under the leading foot, which sees a gap narrower than the sprite),
// the playspace bounds, or being blocked (x differs from where last tick
// left it); 'air' while falling, when nothing is read as being blocked.
// Patrolling turns at every stop; wandering turns and stands at random;
// following walks toward the player and simply stops.
export const WALKERS_HELPER_CODE = [
  'var WALK_SPEED = 2;',
  'function walkOnBlocks(spriteId, dir) {',
  '  usePlatformBody(spriteId);',
  // 'scale' is the on-screen size in pixels; 'width' would be the costume's
  // own unscaled width.
  "  var size = getProp(spriteId, 'scale');",
  '  var half = size > 0 ? size / 2 : 20;',
  '  if (!platformGrounded(spriteId)) {',
  `    setProp(spriteId, 'walkExpX', ${PATROL_X_UNKNOWN});`,
  "    return 'air';",
  '  }',
  "  var expected = getProp(spriteId, 'walkExpX');",
  '  var blocked =',
  `    expected !== ${PATROL_X_UNKNOWN} &&`,
  "    getProp(spriteId, 'x') !== expected;",
  "  var stopped = '';",
  '  if (blocked) {',
  "    stopped = 'blocked';",
  '  } else if (dir !== 0) {',
  "    changePropBy(spriteId, 'x', WALK_SPEED * dir);",
  '    if (!platformSupportAhead(spriteId, dir)) {',
  "      changePropBy(spriteId, 'x', -WALK_SPEED * dir);",
  "      stopped = 'edge';",
  '    }',
  "    var x = getProp(spriteId, 'x');",
  '    if (x <= half && dir < 0) {',
  "      stopped = 'bound';",
  '    }',
  `    if (x >= ${APP_WIDTH} - half && dir > 0) {`,
  "      stopped = 'bound';",
  '    }',
  '  }',
  "  setProp(spriteId, 'walkExpX', getProp(spriteId, 'x'));",
  '  return stopped;',
  '}',
  'function patrollingOnBlocks() {',
  '  return {',
  '    func: function (spriteId) {',
  "      if (getProp(spriteId, 'walkDir') == undefined) {",
  "        setProp(spriteId, 'walkDir', 1);",
  `        setProp(spriteId, 'walkExpX', ${PATROL_X_UNKNOWN});`,
  '      }',
  "      var dir = getProp(spriteId, 'walkDir');",
  "      var pause = getProp(spriteId, 'walkPause') || 0;",
  '      var stopped = walkOnBlocks(spriteId, pause > 0 ? 0 : dir);',
  '      if (pause > 0) {',
  "        setProp(spriteId, 'walkPause', pause - 1);",
  "      } else if (stopped && stopped !== 'air') {",
  "        setProp(spriteId, 'walkDir', -dir);",
  `        setProp(spriteId, 'walkPause', ${TURN_PAUSE_TICKS});`,
  '      }',
  '    },',
  "    name: 'patrolling on blocks',",
  '  };',
  '}',
  'function wanderingOnBlocks() {',
  '  return {',
  '    func: function (spriteId) {',
  "      if (getProp(spriteId, 'walkDir') == undefined) {",
  "        setProp(spriteId, 'walkDir', randomNumber(0, 1) ? 1 : -1);",
  `        setProp(spriteId, 'walkExpX', ${PATROL_X_UNKNOWN});`,
  '      }',
  "      var dir = getProp(spriteId, 'walkDir');",
  "      var pause = getProp(spriteId, 'walkPause') || 0;",
  '      var stopped = walkOnBlocks(spriteId, pause > 0 ? 0 : dir);',
  '      if (pause > 0) {',
  "        setProp(spriteId, 'walkPause', pause - 1);",
  '        if (pause === 1) {',
  // Setting off again in a direction of its own choosing.
  "          setProp(spriteId, 'walkDir', randomNumber(0, 1) ? 1 : -1);",
  '        }',
  "      } else if (stopped && stopped !== 'air') {",
  "        setProp(spriteId, 'walkDir', -dir);",
  `        setProp(spriteId, 'walkPause', ${TURN_PAUSE_TICKS});`,
  `      } else if (randomNumber(1, ${WANDER_STAND_EVERY}) === 1) {`,
  `        setProp(spriteId, 'walkPause', randomNumber(${WANDER_STAND_TICKS[0]}, ${WANDER_STAND_TICKS[1]}));`,
  '      }',
  '    },',
  "    name: 'wandering on blocks',",
  '  };',
  '}',
  'function followingPlayerOnBlocks() {',
  '  return {',
  '    func: function (spriteId) {',
  "      if (getProp(spriteId, 'walkExpX') == undefined) {",
  `        setProp(spriteId, 'walkExpX', ${PATROL_X_UNKNOWN});`,
  '      }',
  "      var target = getProp({group: 'players'}, 'x');",
  '      var dir = 0;',
  '      if (target !== undefined) {',
  "        var dx = target - getProp(spriteId, 'x');",
  `        if (dx > ${FOLLOW_REACH_PX}) {`,
  '          dir = 1;',
  `        } else if (dx < -${FOLLOW_REACH_PX}) {`,
  '          dir = -1;',
  '        }',
  '      }',
  // A gap or a wall between them: the follower waits where it is.
  '      walkOnBlocks(spriteId, dir);',
  '    },',
  "    name: 'following the player',",
  '  };',
  '}',
].join('\n');
