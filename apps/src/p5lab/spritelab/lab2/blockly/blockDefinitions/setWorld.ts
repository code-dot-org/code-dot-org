import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {compileWorldPrelude} from '../../world';
import {FIELD_WORLD_TYPE, worldFromFieldValue} from '../worldField';

export const SET_WORLD_BLOCK_TYPE = 'spritelab2_setWorld';

// Marks generated code that holds a set world block, so placeWorld leaves
// out the scene's saved world.
export const SET_WORLD_MARKER = '/* set world */';

/** ?world-block: places the world drawn on this block when it runs. */
const definition: BlockJson = {
  type: SET_WORLD_BLOCK_TYPE,
  message0: 'set world %1',
  args0: [{type: FIELD_WORLD_TYPE, name: 'WORLD'}],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip: 'Places this world. Click the picture to edit it.',
};

const generator: GeneratorFunction = block =>
  `${SET_WORLD_MARKER}\n${compileWorldPrelude(
    worldFromFieldValue(block.getFieldValue('WORLD'))
  )}`;

export default {definition, generator};

/** A scene's program: its saved world ahead of its code, unless the code
    has set world blocks, which place their own worlds. */
export function placeWorld(world: string, code: string): string {
  return code.includes(SET_WORLD_MARKER) ? code : world + code;
}
