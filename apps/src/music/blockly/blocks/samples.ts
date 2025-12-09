import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';

import {BlockTypes} from '../blockTypes';
import {FIELD_SOUNDS_NAME, SOUND_VALUE_TYPE} from '../constants';
import {fieldSoundsDefinition} from '../fields';
import {MusicBlockConfig} from '../types';

/**
 * Value block for a sample
 */
export const valueSample: MusicBlockConfig = {
  definition: {
    type: BlockTypes.VALUE_SAMPLE,
    message0: '%1',
    args0: [fieldSoundsDefinition],
    style: BlockStyles.LAB_BLOCKS,
    output: SOUND_VALUE_TYPE,
  },
  generator: block => [block.getFieldValue(FIELD_SOUNDS_NAME), Order.ATOMIC],
};
