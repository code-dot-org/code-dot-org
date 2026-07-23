import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {FIELD_GRID_SINGLE_TYPE} from '../gridFields';
import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

const definition: BlockJson = {
  type: 'spritelab2_makeSpriteAtGrid',
  message0: 'make new %1 sprite %2 at grid location: %3',
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
  `makeSpriteAtGrid(${block.getFieldValue('ANIMATION_NAME')}, ` +
  `${JSON.stringify(block.getFieldValue('GRID'))});\n`;

// Plain placement on the same 8x8 grid the platform blocks use — no group, no
// controls; just makeNewSpriteAnon at the marked cell's center.
const helperCode = [
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
].join('\n');

export default {definition, generator, helperCode};
