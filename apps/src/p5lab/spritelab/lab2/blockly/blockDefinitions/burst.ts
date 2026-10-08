import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {BURST_LOOKS, MAX_BURST_COUNT} from '../../bursts';
import {noteImageFieldValue} from '../../imageReferences';
import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

export const BURST_BLOCK_TYPE = 'spritelab2_burst';

export const BURST_LOOK_OPTIONS: [string, string][] = BURST_LOOKS.map(look => [
  look,
  look,
]);

/** Fling sparks or confetti out from a sprite: a flourish that passes
    through everything and is gone in under a second. A second burst from
    the same sprite adds to the first. */
const definition: BlockJson = {
  type: BURST_BLOCK_TYPE,
  message0: 'burst %1 %2 from %3',
  args0: [
    {
      type: 'field_number',
      name: 'COUNT',
      value: 20,
      min: 1,
      max: MAX_BURST_COUNT,
      precision: 1,
    },
    {type: 'field_dropdown', name: 'LOOK', options: BURST_LOOK_OPTIONS},
    {type: FIELD_COSTUME_TYPE, name: 'ORIGIN'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip: 'Fling sparks or confetti out from a sprite for a moment.',
};

const generator: GeneratorFunction = block =>
  `burstParticles(${Number(block.getFieldValue('COUNT'))}, ${JSON.stringify(
    block.getFieldValue('LOOK')
  )}, {costume: ${noteImageFieldValue(block.getFieldValue('ORIGIN'))}});\n`;

export default {definition, generator};
