import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

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
  `makePlatformPlayer(${block.getFieldValue('ANIMATION_NAME')}, ` +
  `${JSON.stringify(block.getFieldValue('GRID'))});\n`;

// A player sprite at the marked grid cell, plus arrow movement and a space
// jump. Assumes the zGameDev helper library (per-tick gravity, player/wall
// collisions, cell-sized sprites). Keyed to the 'players' group, not the
// costume, so a label that fails to round-trip can't orphan the player from
// its physics. Movement reads the sprite's own speed so "set speed" still
// applies; setProp velocityY negates, so jumpSpeed is upward.
const helperCode = [
  'function makePlatformPlayer(animation, layout) {',
  '  var cell = 400 / layout.length;',
  '  var jumpSpeed = 13.5;',
  '  var colliderWidth = 0.7;',
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
  "  setColliderWidth({group: 'players'}, colliderWidth);",
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
].join('\n');

export default {definition, generator, helperCode};
