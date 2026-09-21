import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const PLACEHOLDER_BLOCK_TYPE = 'spritelab2_placeholder';

/** Registered in setup.ts: draws the block's outline dashed. */
export const PLACEHOLDER_OUTLINE_EXTENSION = 'spritelab2_placeholder_outline';

// A slot a level marks for the student to fill, used as the shadow of a
// statement input or a next connection: it draws where a block should go,
// gives way to the block dropped there, and runs nothing.
const definition: BlockJson = {
  type: PLACEHOLDER_BLOCK_TYPE,
  message0: 'drop a block here',
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  extensions: [PLACEHOLDER_OUTLINE_EXTENSION],
  tooltip: 'Drag a block from the toolbox into this spot.',
};

const generator: GeneratorFunction = () => '';

export default {definition, generator};
