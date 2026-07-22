import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {FIELD_GRID_TYPE} from '../gridFields';
import {FIELD_BLOCK_IMAGE_TYPE} from '../imagePickerFields';

const definition: BlockJson = {
  type: 'spritelab2_makePlatformBlocks',
  message0: 'make %1 platform blocks %2 using grid: %3',
  args0: [
    // Platform pieces come from the 'blocks' image category.
    {type: FIELD_BLOCK_IMAGE_TYPE, name: 'ANIMATION_NAME'},
    // Row break: picker on the first row, grid on its own below.
    {type: 'input_dummy', name: 'ROW_BREAK'},
    {type: FIELD_GRID_TYPE, name: 'GRID'},
  ],
  inputsInline: false,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
};

// Straight to the native command: the 'walls' group is what zGameDev collides
// players against.
const generator: GeneratorFunction = block =>
  `makeEnvironmentSprites(${block.getFieldValue('ANIMATION_NAME')}, ` +
  `'walls', ${JSON.stringify(block.getFieldValue('GRID'))});\n`;

export default {definition, generator};
