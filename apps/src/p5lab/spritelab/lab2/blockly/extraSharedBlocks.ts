import {BlockDefinition} from '@cdo/apps/blockly/types';

// Lab-owned additions to the level's shared block pool, delivered the same
// way DB pool blocks are (block config + interpreted helperCode, which the
// engine prepends to user code).
// TODO: move these into the DB under a new 'spritelab2' block pool.
export const SPRITELAB2_EXTRA_SHARED_BLOCKS = [
  {
    name: 'spritelab2_movingLeft',
    pool: 'spritelab2',
    category: 'Behaviors',
    config: {
      func: 'movingLeft',
      blockText: 'moving left',
      returnType: 'Behavior',
      style: 'behavior_blocks',
    },
    helperCode: [
      'function movingLeft() {',
      '  return {',
      '    func: function (spriteId) {',
      '      moveInDirection(spriteId, 2, "West");',
      '    },',
      "    name: 'moving left',",
      '  };',
      '}',
    ].join('\n'),
  },
  {
    name: 'spritelab2_movingWithArrowKeys',
    pool: 'spritelab2',
    category: 'Behaviors',
    config: {
      func: 'movingWithArrowKeys',
      blockText: 'moving with arrow keys',
      returnType: 'Behavior',
      style: 'behavior_blocks',
    },
    // The oceanSetup helper libraries' moving_with_arrow_keys, in the
    // behavior-factory shape this pool uses. Moves at the sprite's own
    // speed property, like the classic behavior.
    helperCode: [
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
    ].join('\n'),
  },
  {
    name: 'spritelab2_patrollingLeftRight',
    pool: 'spritelab2',
    category: 'Behaviors',
    config: {
      func: 'patrollingLeftRight',
      blockText: 'patrolling left and right',
      returnType: 'Behavior',
      style: 'behavior_blocks',
    },
    // Mirrors NativeSpriteLab's patrollingUpDown, on x. Its own direction
    // property, so both patrols can ride one sprite.
    helperCode: [
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
    ].join('\n'),
  },
] as unknown as BlockDefinition[];
