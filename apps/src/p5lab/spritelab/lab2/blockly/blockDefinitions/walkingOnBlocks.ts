import {APP_WIDTH} from '@cdo/apps/p5lab/constants';

// The three walks on blocks, as interpreted source.

// Ticks a walker stands at each turn before setting off the other way:
// about a quarter of a second, enough to read as looking around.
export const TURN_PAUSE_TICKS = 8;

// walkExpX value meaning "no expected x": positions are always positive
// (the resolver clamps sprites inside the view), so -1 can't be one.
export const WALK_X_UNKNOWN = -1;

// A wanderer stops to look around about this often, in ticks, and for a
// stand of between the two lengths.
export const WANDER_STAND_EVERY = 90;
export const WANDER_STAND_TICKS: [number, number] = [8, 40];

// A follower stops this close to the player, centre to centre: one cell,
// so it stands beside the player rather than over it.
export const FOLLOW_REACH_PX = 40;

// walkOnBlocks walks one tick in a direction (0 stands still) and reports
// what stopped it: 'edge', 'bound', 'blocked', or 'air' while falling.
export const WALKERS_HELPER_CODE = [
  'var WALK_SPEED = 2;',
  // Resets a walker's state when a different walker last ran on the sprite;
  // true when it did.
  'function startWalk(spriteId, name, dir) {',
  "  if (getProp(spriteId, 'walkOf') === name) {",
  '    return false;',
  '  }',
  "  setProp(spriteId, 'walkOf', name);",
  "  setProp(spriteId, 'walkDir', dir);",
  "  setProp(spriteId, 'walkPause', 0);",
  "  setProp(spriteId, 'walkRoll', 0);",
  `  setProp(spriteId, 'walkExpX', ${WALK_X_UNKNOWN});`,
  '  return true;',
  '}',
  // Counts a stand down by one tick; returns the ticks left before this one.
  'function walkPause(spriteId) {',
  "  var pause = getProp(spriteId, 'walkPause') || 0;",
  '  if (pause > 0) {',
  "    setProp(spriteId, 'walkPause', pause - 1);",
  '  }',
  '  return pause;',
  '}',
  'function walkOnBlocks(spriteId, dir) {',
  '  usePlatformBody(spriteId);',
  // 'scale' is the on-screen size in pixels; 'width' would be the costume's
  // own unscaled width.
  "  var size = getProp(spriteId, 'scale');",
  '  var half = size > 0 ? size / 2 : 20;',
  '  if (!platformGrounded(spriteId)) {',
  `    setProp(spriteId, 'walkExpX', ${WALK_X_UNKNOWN});`,
  "    return 'air';",
  '  }',
  "  var expected = getProp(spriteId, 'walkExpX');",
  '  var blocked =',
  `    expected !== ${WALK_X_UNKNOWN} &&`,
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
  "      startWalk(spriteId, 'patrol', 1);",
  "      var dir = getProp(spriteId, 'walkDir');",
  '      var pause = walkPause(spriteId);',
  '      var stopped = walkOnBlocks(spriteId, pause > 0 ? 0 : dir);',
  "      if (pause === 0 && stopped && stopped !== 'air') {",
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
  "      if (startWalk(spriteId, 'wander', 0)) {",
  "        setProp(spriteId, 'walkDir', randomNumber(0, 1) ? 1 : -1);",
  '      }',
  "      var dir = getProp(spriteId, 'walkDir');",
  '      var pause = walkPause(spriteId);',
  '      var stopped = walkOnBlocks(spriteId, pause > 0 ? 0 : dir);',
  '      if (pause > 0) {',
  // Only a stand of its own choosing ends in a direction of its own
  // choosing: the stand after a turn keeps the turn.
  "        if (pause === 1 && getProp(spriteId, 'walkRoll')) {",
  "          setProp(spriteId, 'walkRoll', 0);",
  "          setProp(spriteId, 'walkDir', randomNumber(0, 1) ? 1 : -1);",
  '        }',
  "      } else if (stopped && stopped !== 'air') {",
  "        setProp(spriteId, 'walkDir', -dir);",
  `        setProp(spriteId, 'walkPause', ${TURN_PAUSE_TICKS});`,
  `      } else if (randomNumber(1, ${WANDER_STAND_EVERY}) === 1) {`,
  "        setProp(spriteId, 'walkRoll', 1);",
  `        setProp(spriteId, 'walkPause', randomNumber(${WANDER_STAND_TICKS[0]}, ${WANDER_STAND_TICKS[1]}));`,
  '      }',
  '    },',
  "    name: 'wandering on blocks',",
  '  };',
  '}',
  'function followingPlayerOnBlocks() {',
  '  return {',
  '    func: function (spriteId) {',
  "      startWalk(spriteId, 'follow', 0);",
  '      if (walkPause(spriteId) > 0) {',
  '        walkOnBlocks(spriteId, 0);',
  '        return;',
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
  // A gap or a wall between them: the follower waits a moment, then
  // tries again, rather than pressing against it every tick.
  '      var stopped = walkOnBlocks(spriteId, dir);',
  "      if (stopped && stopped !== 'air') {",
  `        setProp(spriteId, 'walkPause', ${TURN_PAUSE_TICKS});`,
  '      }',
  '    },',
  "    name: 'following the player',",
  '  };',
  '}',
].join('\n');
