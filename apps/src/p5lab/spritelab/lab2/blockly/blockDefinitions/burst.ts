import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {BURST_LOOKS, MAX_BURST_COUNT} from '../../bursts';

export const BURST_BLOCK_TYPE = 'spritelab2_burst';

export const BURST_LOOK_OPTIONS: [string, string][] = BURST_LOOKS.map(look => [
  look,
  look,
]);

/** Fling sparks, confetti or dust out from a sprite: a flourish that
    passes through everything and is gone in under a second. A second burst
    from the same sprite adds to the first. */
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
    {type: 'input_value', name: 'ORIGIN', check: 'Sprite'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip: 'Fling sparks, confetti or dust out from a sprite for a moment.',
};

// An empty socket, or one naming no sprite, bursts from the play area center.
const generator: GeneratorFunction = (block, javascript) =>
  `burstParticles(${Number(block.getFieldValue('COUNT'))}, ${JSON.stringify(
    block.getFieldValue('LOOK')
  )}, ${javascript.valueToCode(block, 'ORIGIN', Order.COMMA) || 'null'});\n`;

export default {definition, generator};
