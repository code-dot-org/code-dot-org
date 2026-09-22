import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {noteImageFieldValue} from '../../imageReferences';
import {EVERY_IMAGE} from '../../runtimeImages';

export const MAKE_IMAGE_GRID_BLOCK_TYPE = 'spritelab2_makeImageGrid';

const definition: BlockJson = {
  type: MAKE_IMAGE_GRID_BLOCK_TYPE,
  message0: 'make a grid of all my images',
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
  tooltip:
    'Makes one sprite for each image in the Images tab, in rows below the ' +
    'top of the screen.',
};

// The names are known only at run time; registering EVERY_IMAGE widens the
// scene preload to the whole list.
const generator: GeneratorFunction = () => {
  noteImageFieldValue(JSON.stringify(EVERY_IMAGE));
  return 'makeImageGrid();\n';
};

export default {definition, generator};
