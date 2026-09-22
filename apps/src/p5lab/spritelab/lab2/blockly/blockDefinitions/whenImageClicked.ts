import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {HAT_OPTIONS, hatBody} from './eventHat';

export const WHEN_IMAGE_CLICKED_BLOCK_TYPE = 'spritelab2_whenImageClicked';

// Choosing is part of the click, not a block of its own: a camera roll
// is the case this exists for, and there the click always means "this one".
const definition: BlockJson = {
  type: WHEN_IMAGE_CLICKED_BLOCK_TYPE,
  message0: 'when any image clicked, choose it',
  nextStatement: null,
  style: BlockStyles.EVENT,
  tooltip:
    'Runs the blocks below when a picture is clicked. That picture becomes ' +
    'the "chosen image" in every scene until another one is clicked.',
};

const generator: GeneratorFunction = (block, generatorInstance) =>
  `whenImageClicked(function () {\n${hatBody(block, generatorInstance)}});\n`;

export default {definition, generator, extendedOptions: HAT_OPTIONS};
