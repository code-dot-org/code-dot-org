import {Order} from 'blockly/javascript';
import {defineBlock} from '@code-dot-org/blockly-workspace';

import {BlockTypes} from '../blockTypes';
import {FIELD_SOUNDS_NAME, SOUND_VALUE_TYPE} from '../constants';
import {fieldSoundsDefinition} from '../fields';

/**
 * Value block for a sample
 */
export const valueSample = defineBlock({
  type: BlockTypes.VALUE_SAMPLE,
  message0: '%1',
  args0: [fieldSoundsDefinition],
  style: 'lab_blocks',
  output: SOUND_VALUE_TYPE,
  tooltip: '',
  generator: {
    javascript(block) {
      return [block.getFieldValue(FIELD_SOUNDS_NAME), Order.ATOMIC];
    },
  },
});

const blocks = [valueSample];

export default blocks;
