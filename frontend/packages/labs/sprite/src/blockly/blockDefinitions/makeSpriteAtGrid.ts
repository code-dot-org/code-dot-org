import {noteImageFieldValue} from '../../imageReferences';
import {BlockStyles} from '../constants';
import {GRID_SINGLE_FIELD} from '../gridFields';
import {COSTUME_FIELD} from '../imagePickerFields';
import {type BlockJson, type GeneratorFunction} from '../types';

const definition: BlockJson = {
  type: 'spritelab2_makeSpriteAtGrid',
  message0: 'make new %1 sprite %2 at grid location: %3',
  args0: [
    {type: COSTUME_FIELD, name: 'ANIMATION_NAME'},
    // Row break: picker on the first row, grid on its own below.
    {type: 'input_dummy', name: 'ROW_BREAK'},
    {type: GRID_SINGLE_FIELD, name: 'GRID'},
  ],
  inputsInline: false,
  previousStatement: true,
  nextStatement: true,
  style: BlockStyles.SPRITE,
};

const generator: GeneratorFunction = block =>
  `makeSpriteAtGrid(${noteImageFieldValue(
    block.getFieldValue('ANIMATION_NAME'),
  )}, ` + `${JSON.stringify(block.getFieldValue('GRID'))});\n`;

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
