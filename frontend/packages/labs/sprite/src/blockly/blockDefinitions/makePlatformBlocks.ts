import {noteImageFieldValue} from '../../imageReferences';
import {BlockStyles} from '../constants';
import {GRID_FIELD} from '../gridFields';
import {BLOCK_IMAGE_FIELD} from '../imagePickerFields';
import {type BlockJson, type GeneratorFunction} from '../types';

const definition: BlockJson = {
  type: 'spritelab2_makePlatformBlocks',
  message0: 'make %1 platform blocks %2 using grid: %3',
  args0: [
    // Platform pieces come from the 'blocks' image category.
    {type: BLOCK_IMAGE_FIELD, name: 'ANIMATION_NAME'},
    // Row break: picker on the first row, grid on its own below.
    {type: 'input_dummy', name: 'ROW_BREAK'},
    {type: GRID_FIELD, name: 'GRID'},
  ],
  inputsInline: false,
  previousStatement: true,
  nextStatement: true,
  style: BlockStyles.SPRITE,
};

const generator: GeneratorFunction = block =>
  `makeEnvironmentSprites(${noteImageFieldValue(
    block.getFieldValue('ANIMATION_NAME'),
  )}, ` + `'walls', ${JSON.stringify(block.getFieldValue('GRID'))});\n`;

export default {definition, generator};
