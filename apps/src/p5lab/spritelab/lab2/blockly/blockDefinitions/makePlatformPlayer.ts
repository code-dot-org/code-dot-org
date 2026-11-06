import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {noteImageFieldValue} from '../../imageReferences';
import {PLAYER_GROUP} from '../../playerGroups';
import {FIELD_GRID_SINGLE_TYPE} from '../gridFields';
import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

const definition: BlockJson = {
  type: 'spritelab2_makePlatformPlayer',
  message0: 'make platform player %1 %2 at grid location: %3',
  args0: [
    {type: FIELD_COSTUME_TYPE, name: 'ANIMATION_NAME'},
    // Row break: picker on the first row, grid on its own below.
    {type: 'input_dummy', name: 'ROW_BREAK'},
    {type: FIELD_GRID_SINGLE_TYPE, name: 'GRID'},
  ],
  inputsInline: false,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
};

const generator: GeneratorFunction = block =>
  `makePlatformPlayer(${noteImageFieldValue(
    block.getFieldValue('ANIMATION_NAME')
  )}, ` + `${JSON.stringify(block.getFieldValue('GRID'))});\n`;

// A player sprite at the marked grid cell, plus arrow movement and a jump
// on space or up. Assumes the zGameDev helper library (per-tick gravity,
// player/wall collisions, cell-sized sprites). Keyed to the player group,
// not the costume, so a label that fails to round-trip can't orphan the
// player from its physics. Movement reads the sprite's own speed so
// "set speed" still applies; the jump goes through platformJump, which
// checks footing and jumps against gravity whichever way it points. At
// zero gravity there is no jump and the up and down arrows steer instead.
// Clears a two-tile step with a little margin (apex ~2.4 tiles at the
// default gravity).
export const JUMP_SPEED = 13;

/** The keys that steer one platform player. */
export interface PlatformControlKeys {
  left: string;
  right: string;
  /** Steers up at zero gravity, jumps otherwise. */
  up: string;
  down: string;
  /** A second jump key, if any. */
  jump?: string;
}

/**
 * Helper code that wires a player group's keys. The function is named
 * `name` and guarded by a flag, so several player-making blocks in one
 * program share one set of handlers rather than stacking duplicates.
 */
export function platformControlsHelper(
  name: string,
  group: string,
  keys: PlatformControlKeys
): string[] {
  const player = `{group: ${JSON.stringify(group)}}`;
  const move = (direction: string) =>
    `moveInDirection(${player}, getProp(${player}, 'speed'), '${direction}');`;
  return [
    `var ${name}Wired = false;`,
    `function ${name}() {`,
    `  if (${name}Wired) {`,
    '    return;',
    '  }',
    `  ${name}Wired = true;`,
    `  keyPressed('while', '${keys.left}', function () {`,
    `    ${move('West')}`,
    '  });',
    `  keyPressed('while', '${keys.right}', function () {`,
    `    ${move('East')}`,
    '  });',
    `  keyPressed('while', '${keys.up}', function () {`,
    '    if (platformGravity() === 0) {',
    `      ${move('North')}`,
    '    }',
    '  });',
    `  keyPressed('when', '${keys.up}', function () {`,
    '    if (platformGravity() !== 0) {',
    `      platformJump(${JUMP_SPEED}, ${JSON.stringify(group)});`,
    '    }',
    '  });',
    `  keyPressed('while', '${keys.down}', function () {`,
    '    if (platformGravity() === 0) {',
    `      ${move('South')}`,
    '    }',
    '  });',
    ...(keys.jump
      ? [
          `  keyPressed('when', '${keys.jump}', function () {`,
          `    platformJump(${JUMP_SPEED}, ${JSON.stringify(group)});`,
          '  });',
        ]
      : []),
    '}',
  ];
}

const helperCode = [
  ...platformControlsHelper('wirePlatformControls', PLAYER_GROUP, {
    left: 'left',
    right: 'right',
    up: 'up',
    down: 'down',
    jump: 'space',
  }),
  'function makePlatformPlayer(animation, layout) {',
  '  var cell = 400 / layout.length;',
  '  for (var row = 0; row < layout.length; row++) {',
  '    for (var col = 0; col < layout[row].length; col++) {',
  '      if (layout[row][col]) {',
  `        makeNewGroupSprite(animation, ${JSON.stringify(PLAYER_GROUP)}, {`,
  '          x: cell / 2 + cell * col,',
  '          y: cell / 2 + cell * row,',
  '        });',
  '      }',
  '    }',
  '  }',
  '  wirePlatformControls();',
  '}',
].join('\n');

export default {definition, generator, helperCode};
