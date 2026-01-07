import * as Blockly from 'blockly/core';
import type {BlockDefinition} from '@code-dot-org/blockly-workspace';

import {BlockTypes} from '../blockTypes';
import {isBlockInsideWhenRun} from '../blockUtils';
import {FIELD_SOUNDS_NAME} from '../constants';
import {fieldSoundsDefinition} from '../fields';

const blocks: BlockDefinition[] = [
  {
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION,
    message0: 'play sound %1',
    args0: [fieldSoundsDefinition],
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    style: 'lab_blocks',
    tooltip: 'play sound',
    helpUrl: '',
    generator: {
      javascript(block: Blockly.Block) {
        return (
          'Sequencer.playSoundAtMeasureById("' +
          block.getFieldValue(FIELD_SOUNDS_NAME) +
          '", ' +
          'currentMeasureLocation' +
          ', ' +
          (isBlockInsideWhenRun(block) ? 'true' : 'false') +
          ');\n'
        );
      },
    },
  },
  {
    type: BlockTypes.SET_CURRENT_LOCATION_NEXT_MEASURE,
    message0: 'go to next measure',
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    style: 'lab_blocks',
    tooltip: 'go to next measure',
    helpUrl: '',
    generator: {
      javascript(_block: Blockly.Block) {
        return 'currentMeasureLocation++\n';
      },
    },
  },
];

export default blocks;
