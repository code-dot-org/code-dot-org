import musicI18n from '../../locale';
import {BlockTypes} from '../blockTypes';
import {isBlockInsideWhenRun} from '../blockUtils';
import {FIELD_SOUNDS_NAME} from '../constants';
import {fieldSoundsDefinition} from '../fields';

export const playSound = {
  definition: {
    type: BlockTypes.PLAY_SOUND,
    style: 'lab_blocks',
    message0: musicI18n.blockly_blockPlaySoundAtMeasure({
      sound: '%1',
      measure: '%2',
    }),
    args0: [
      fieldSoundsDefinition,
      {
        type: 'input_value',
        name: 'measure',
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    tooltip: musicI18n.blockly_blockPlaySoundAtMeasureTooltip(),
    helpUrl: '',
  },
  generator: ctx =>
    'Sequencer.playSoundAtMeasureById("' +
    ctx.getFieldValue(FIELD_SOUNDS_NAME) +
    '", ' +
    Blockly.JavaScript.valueToCode(
      ctx,
      'measure',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    ) +
    ', ' +
    (isBlockInsideWhenRun(ctx) ? 'true' : 'false') +
    ', "' +
    ctx.id +
    '");\n',
};
