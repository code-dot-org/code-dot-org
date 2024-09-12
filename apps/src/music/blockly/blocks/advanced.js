import musicI18n from '../../locale';
import {BlockTypes} from '../blockTypes';
import {isBlockInsideWhenRun} from '../blockUtils';
import {
  FIELD_CHORD_NAME,
  FIELD_PATTERN_NAME,
  FIELD_SOUNDS_NAME,
} from '../constants';
import {
  fieldChordDefinition,
  fieldPatternDefinition,
  fieldSoundsDefinition,
} from '../fields';

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

export const playPatternAtMeasure = {
  definition: {
    type: BlockTypes.PLAY_PATTERN_AT_MEASURE,
    message0: musicI18n.blockly_blockPlayPatternAtMeasure({
      pattern: '%1',
      measure: '%2',
    }),
    args0: [
      fieldPatternDefinition,
      {
        type: 'input_value',
        name: 'measure',
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockPlayPatternAtMeasureTooltip(),
    helpUrl: '',
  },
  generator: block =>
    `Sequencer.playPatternAtMeasureById(${JSON.stringify(
      block.getFieldValue(FIELD_PATTERN_NAME)
    )}, ${Blockly.JavaScript.valueToCode(
      block,
      'measure',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    )}, "${block.id}");`,
};

export const playChordAtMeasure = {
  definition: {
    type: BlockTypes.PLAY_CHORD_AT_MEASURE,
    message0: musicI18n.blockly_blockPlayChordAtMeasure({
      chord: '%1',
      measure: '%2',
    }),
    args0: [
      fieldChordDefinition,
      {
        type: 'input_value',
        name: 'measure',
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockPlayChordAtMeasureTooltip(),
    helpUrl: '',
  },
  generator: block =>
    `Sequencer.playChordAtMeasureById(${JSON.stringify(
      block.getFieldValue(FIELD_CHORD_NAME)
    )}, ${Blockly.JavaScript.valueToCode(
      block,
      'measure',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    )}, "${block.id}");`,
};
