import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {MAX_ZOOM, MIN_ZOOM} from '../../camera';

/**
 * Zoom the view in on the player (platform scenes). 1 is the whole world;
 * larger values narrow the view and it scrolls with the player. The change
 * eases in over a few frames rather than jumping.
 */
const definition: BlockJson = {
  type: 'spritelab2_setCameraZoom',
  message0: 'set zoom to %1',
  args0: [
    {
      type: 'field_number',
      name: 'ZOOM',
      value: 2,
      min: MIN_ZOOM,
      max: MAX_ZOOM,
      precision: 0.1,
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
  tooltip: 'Zoom in a little, and then the world scrolls as the player moves.',
};

const generator: GeneratorFunction = block =>
  `setCameraZoom(${Number(block.getFieldValue('ZOOM'))});\n`;

export default {definition, generator};
