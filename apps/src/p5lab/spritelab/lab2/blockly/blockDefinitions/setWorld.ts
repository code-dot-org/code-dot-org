import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {FIELD_WORLD_TYPE} from '../worldField';

export const SET_WORLD_BLOCK_TYPE = 'spritelab2_setWorld';

// Marks where a set world block sits in the generated code; placeWorld puts
// the scene's world there.
export const SET_WORLD_MARKER = '/* set world */';

/** ?world-block=true: the scene's world appears when this block runs, not
    before the scene's code. */
const definition: BlockJson = {
  type: SET_WORLD_BLOCK_TYPE,
  message0: 'set world %1',
  args0: [{type: FIELD_WORLD_TYPE, name: 'WORLD'}],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip: 'Places the scene’s world. Click the picture to edit it.',
};

const generator: GeneratorFunction = () => `${SET_WORLD_MARKER}\n`;

export default {definition, generator};

/** A scene's program: its world placed where a set world block runs, or
    ahead of its code when it has none. */
export function placeWorld(world: string, code: string): string {
  return code.includes(SET_WORLD_MARKER)
    ? code.split(SET_WORLD_MARKER).join(world)
    : world + code;
}
