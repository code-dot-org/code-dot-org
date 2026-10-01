import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {MAX_BURST_COUNT} from '../../bursts';
import {noteImageFieldValue} from '../../imageReferences';
import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

export const BURST_BLOCK_TYPE = 'spritelab2_burst';

/** Fling copies of an image out from a sprite; they fall, bounce and fade.
    A second burst from the same sprite adds to the first. */
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
    {type: FIELD_COSTUME_TYPE, name: 'IMAGE'},
    {type: FIELD_COSTUME_TYPE, name: 'ORIGIN'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip:
    'Fling copies of an image out from a sprite. They fall, bounce and fade.',
};

const generator: GeneratorFunction = block =>
  `burstParticles(${Number(
    block.getFieldValue('COUNT')
  )}, ${noteImageFieldValue(
    block.getFieldValue('IMAGE')
  )}, {costume: ${noteImageFieldValue(block.getFieldValue('ORIGIN'))}});\n`;

export default {definition, generator};
