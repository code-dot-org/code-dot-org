// Lab-owned behaviors and grid composites, defined in the JSON block format
// (installed in setup.ts alongside the scene blocks). Each block's runtime
// half is interpreted helperCode — JSON has no slot for it, so the engine
// prepends SPRITELAB2_HELPER_CODE the same way it prepends pool blocks'.

import * as BlocklyCore from 'blockly/core';
import {Order} from 'blockly/javascript';

import {CdoFieldBitmap} from '@cdo/apps/blockly/addons/cdoFieldBitmap';
import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {FIELD_BLOCK_IMAGE_TYPE, FIELD_COSTUME_TYPE} from '../imagePickerFields';

export const FIELD_GRID_TYPE = 'field_spritelab2_grid';
export const FIELD_GRID_SINGLE_TYPE = 'field_spritelab2_grid_single';

const GRID_CONFIG = {
  height: 8,
  width: 8,
  fieldHeight: 42,
  buttons: {randomize: false, clear: true},
};

// A null starting value renders the empty grid from GRID_CONFIG (the
// constructor's TS type doesn't admit null, but the classic blocks.js call
// passes it from JS and the plugin handles it).
const EMPTY_GRID = null as unknown as number[][];

// Single-select: one position, so a new mark replaces the old one.
function singleCellValidator(newValue: number[][]): number[][] {
  let marks = 0;
  return newValue.map(row => row.map(cell => (cell && ++marks === 1 ? 1 : 0)));
}

// Registered field types (see setup.ts): the 8x8 placement grid, plain and
// single-select. FieldJson is a closed type, so the variants are separate
// field types rather than one type with a config property.
export class GridField extends CdoFieldBitmap {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new GridField(EMPTY_GRID, undefined, GRID_CONFIG);
  }
}

export class GridSingleField extends CdoFieldBitmap {
  static fromJson(_options: BlocklyCore.FieldConfig) {
    return new GridSingleField(EMPTY_GRID, singleCellValidator, GRID_CONFIG);
  }
}

// A behavior block: a value block generating `func()`, whose helperCode
// defines func as a factory returning {func: perTickFn, name}.
function behavior(
  type: string,
  text: string,
  func: string,
  helperCode: string[]
): ExtraBlock {
  return {
    definition: {
      type,
      message0: text,
      output: 'Behavior',
      style: BlockStyles.BEHAVIOR,
    },
    generator: () => [`${func}()`, Order.FUNCTION_CALL],
    helperCode: helperCode.join('\n'),
  };
}

// A grid composite: image picker + placement grid, generating
// `func("image", [[...]])`. The picker's option values are pre-quoted and the
// grid's field value is a 2d array, so both drop into the call as source text.
function gridComposite(
  type: string,
  message0: string,
  fieldType: string,
  gridFieldType: string,
  func: string,
  helperCode: string[]
): ExtraBlock {
  return {
    definition: {
      type,
      message0,
      args0: [
        {type: fieldType, name: 'ANIMATION_NAME'},
        // Row break: picker on the first row, grid on its own below.
        {type: 'input_dummy', name: 'ROW_BREAK'},
        {type: gridFieldType, name: 'GRID'},
      ],
      previousStatement: null,
      nextStatement: null,
      style: BlockStyles.SPRITE,
    },
    generator: block =>
      `${func}(${block.getFieldValue('ANIMATION_NAME')}, ` +
      `${JSON.stringify(block.getFieldValue('GRID'))});\n`,
    helperCode: helperCode.join('\n'),
  };
}

interface ExtraBlock {
  definition: BlockJson;
  generator: GeneratorFunction;
  helperCode: string;
}

export const SPRITELAB2_EXTRA_BLOCKS: ExtraBlock[] = [
  behavior('spritelab2_movingLeft', 'moving left', 'movingLeft', [
    'function movingLeft() {',
    '  return {',
    '    func: function (spriteId) {',
    '      moveInDirection(spriteId, 2, "West");',
    '    },',
    "    name: 'moving left',",
    '  };',
    '}',
  ]),
  // The oceanSetup helper libraries' moving_with_arrow_keys, in the
  // behavior-factory shape these behaviors use. Moves at the sprite's own
  // speed property, like the classic behavior.
  behavior(
    'spritelab2_movingWithArrowKeys',
    'moving with arrow keys',
    'movingWithArrowKeys',
    [
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
    ]
  ),
  // Mirrors NativeSpriteLab's patrollingUpDown, on x. Its own direction
  // property, so both patrols can ride one sprite.
  behavior(
    'spritelab2_patrollingLeftRight',
    'patrolling left and right',
    'patrollingLeftRight',
    [
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
    ]
  ),
  // Platform patrol: walk left/right along the 'walls' group, turning at
  // any gap or platform edge, at the playspace edge, or when blocked (this
  // tick's x differs from where last tick's step left it — a wall collision
  // pushed it back). Edges/gaps are found with a hasSupportAt point probe
  // half a grid cell ahead of center: a point sees gaps narrower than the
  // sprite, so even a cell-wide patroller turns at a one-cell gap instead
  // of bridging it. Grounding comes from isDirectlyAbove; zGameDev's
  // collide keeps grounded sprites exactly on top of walls, and the
  // playspace floor counts as footing, so a floor patroller just walks the
  // bounds. The knife-edge recovery is a safety net for a sprite that ends
  // up dropping through a gap's zero-overlap seam anyway (e.g. shoved onto
  // it): grounded last tick + airborne now → nudge past the seam, back up
  // to the walking line, cancel the fall.
  behavior(
    'spritelab2_patrollingOnBlocks',
    'patrolling left and right on blocks',
    'patrollingOnBlocks',
    [
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
    ]
  ),
  // The platformer composites. They assume the zGameDev helper library
  // (per-tick gravity + player/wall collisions, 8x8 grid, default sprite size
  // = one cell) — the same assumption the GameDev pool blocks make. Defaults
  // are overridable with the existing blocks (gravity, set speed, ...).
  //
  // One block = a player sprite at the marked grid cell (same 8x8 bitmap
  // widget as "make sprites using grid"; cell math mirrors
  // makeEnvironmentSprites), created directly in the 'players' group
  // (zGameDev then applies gravity/collisions and the cell-sized default),
  // plus arrow movement and a space jump. Everything is keyed to the group,
  // not the costume — a label that fails to round-trip must not orphan the
  // player from its physics. Move speed reads the sprite's own speed
  // property so "set speed" still applies; the jump requires standing on a
  // wall. setProp velocityY negates, so jumpSpeed is upward.
  gridComposite(
    'spritelab2_makePlatformPlayer',
    'make platform player %1 %2 at grid location: %3',
    FIELD_COSTUME_TYPE,
    FIELD_GRID_SINGLE_TYPE,
    'makePlatformPlayer',
    [
      'function makePlatformPlayer(animation, layout) {',
      '  var cell = 400 / layout.length;',
      '  var jumpSpeed = 13;',
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
      "      setProp({group: 'players'}, 'velocityY', jumpSpeed);",
      '    }',
      '  });',
      '}',
    ]
  ),
  // Plain placement on the same 8x8 grid the platform blocks use — no
  // group, no controls; just makeNewSpriteAnon at the marked cell's center.
  gridComposite(
    'spritelab2_makeSpriteAtGrid',
    'make new %1 sprite %2 at grid location: %3',
    FIELD_COSTUME_TYPE,
    FIELD_GRID_SINGLE_TYPE,
    'makeSpriteAtGrid',
    [
      'function makeSpriteAtGrid(animation, layout) {',
      '  var cell = 400 / layout.length;',
      '  for (var row = 0; row < layout.length; row++) {',
      '    for (var col = 0; col < layout[row].length; col++) {',
      '      if (layout[row][col]) {',
      '        makeNewSpriteAnon(animation, {',
      '          x: cell / 2 + cell * col,',
      '          y: cell / 2 + cell * row,',
      '        });',
      '      }',
      '    }',
      '  }',
      '}',
    ]
  ),
  // makeSpritesGrid + environment typing in one: the 'walls' group is what
  // zGameDev collides players against. Platform pieces come from the
  // 'blocks' image category.
  gridComposite(
    'spritelab2_makePlatformBlocks',
    'make %1 platform blocks %2 using grid: %3',
    FIELD_BLOCK_IMAGE_TYPE,
    FIELD_GRID_TYPE,
    'makePlatformBlocks',
    [
      'function makePlatformBlocks(animation, layout) {',
      "  makeEnvironmentSprites(animation, 'walls', layout);",
      '}',
    ]
  ),
];

// The interpreted runtime half, prepended to user code by the engine (shaped
// like level sharedBlocks entries — P5Lab reads .helperCode off each).
export const SPRITELAB2_HELPER_CODE = SPRITELAB2_EXTRA_BLOCKS.map(
  ({helperCode}) => ({helperCode})
);
