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
  // The two platformer composites. They assume the zGameDev helper library
  // (per-tick gravity + player/wall collisions, 8x8 grid, default sprite size
  // = one cell) — the same assumption the GameDev pool blocks make. Defaults
  // are overridable with the existing blocks (gravity, set speed, ...).
  {
    name: 'spritelab2_makePlatformPlayer',
    pool: 'spritelab2',
    category: 'Sprites',
    config: {
      func: 'makePlatformPlayer',
      inline: false,
      blockText:
        'make platform player {ANIMATION_NAME} at grid location: {GRID}',
      style: 'sprite_blocks',
      args: [
        {name: 'ANIMATION_NAME', customInput: 'costumePicker'},
        {name: 'GRID', customInput: 'bitmap'},
      ],
    },
    // One block = a player sprite at the marked grid cell (same 8x8 bitmap
    // widget as "make sprites using grid"; cell math mirrors
    // makeEnvironmentSprites), created directly in the 'players' group
    // (zGameDev then applies gravity/collisions and the cell-sized default),
    // plus arrow movement and a space jump. Everything is keyed to the group,
    // not the costume — a label that fails to round-trip must not orphan the
    // player from its physics. Move speed reads the sprite's own speed
    // property so "set speed" still applies; the jump requires standing on a
    // wall. setProp velocityY negates, so 13 is upward.
    helperCode: [
      'function makePlatformPlayer(animation, layout) {',
      '  var cell = 400 / layout.length;',
      '  for (var row = 0; row < layout.length; row++) {',
      '    for (var col = 0; col < layout[row].length; col++) {',
      '      if (layout[row][col]) {',
      "        makeNewGroupSprite(animation, 'players', {",
      '          x: cell / 2 + cell * col,',
      '          y: cell / 2 + cell * row,',
      '        });',
      '      }',
      '    }',
      '  }',
      "  keyPressed('while', 'left', function () {",
      "    moveInDirection({group: 'players'}, getProp({group: 'players'}, 'speed'), 'West');",
      '  });',
      "  keyPressed('while', 'right', function () {",
      "    moveInDirection({group: 'players'}, getProp({group: 'players'}, 'speed'), 'East');",
      '  });',
      "  keyPressed('when', 'space', function () {",
      "    if (isDirectlyAbove({group: 'players'}, {group: 'walls'})) {",
      "      setProp({group: 'players'}, 'velocityY', 13);",
      '    }',
      '  });',
      '}',
    ].join('\n'),
  },
  {
    name: 'spritelab2_makePlatformBlocks',
    pool: 'spritelab2',
    category: 'Sprites',
    config: {
      func: 'makePlatformBlocks',
      inline: false,
      blockText: 'make {ANIMATION_NAME} platform blocks using grid: {GRID}',
      style: 'sprite_blocks',
      args: [
        {name: 'ANIMATION_NAME', customInput: 'costumePicker'},
        {name: 'GRID', customInput: 'bitmap'},
      ],
    },
    // makeSpritesGrid + environment typing in one: the 'walls' group is what
    // zGameDev collides players against.
    helperCode: [
      'function makePlatformBlocks(animation, layout) {',
      "  makeEnvironmentSprites(animation, 'walls', layout);",
      '}',
    ].join('\n'),
  },
] as unknown as BlockDefinition[];
