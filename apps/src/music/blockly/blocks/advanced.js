import {BlockTypes} from '../blockTypes';
import {isBlockInsideWhenRun} from '../blockUtils';
import {FIELD_SOUNDS_NAME} from '../constants';
import {fieldSoundsDefinition} from '../fields';

export const playSound = {
  definition: {
    type: BlockTypes.PLAY_SOUND,
    style: 'lab_blocks',
    message0: 'play %1 at measure %2',
    args0: [
      fieldSoundsDefinition,
      {
        type: 'input_value',
        name: 'measure'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    tooltip: 'play sound',
    helpUrl: ''
  },
  generator: ctx =>
    'MusicPlayer.playSoundAtMeasureById("' +
    ctx.getFieldValue(FIELD_SOUNDS_NAME) +
    '", ' +
    Blockly.JavaScript.valueToCode(
      ctx,
      'measure',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    ) +
    ', ' +
    (isBlockInsideWhenRun(ctx) ? 'true' : 'false') +
    ');\n'
};
