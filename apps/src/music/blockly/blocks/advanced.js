import {Order} from 'blockly/javascript';

import musicI18n from '../../locale';
import {BlockTypes} from '../blockTypes';
import {
  FIELD_CHORD_NAME,
  FIELD_EFFECT_NAME_OPTIONS,
  FIELD_EFFECTS_EXTENSION,
  FIELD_EFFECTS_NAME,
  FIELD_EFFECTS_VALUE,
  FIELD_PATTERN_NAME,
  FIELD_PATTERNS_VALIDATOR,
  FIELD_SOUNDS_NAME,
  FIELD_SOUNDS_VALIDATOR,
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
    extensions: [FIELD_SOUNDS_VALIDATOR],
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
    ', "' +
    ctx.id +
    '");\n',
};

export const logValue = {
  definition: {
    type: BlockTypes.LOG_VALUE,
    message0: musicI18n.blockly_blockLogValue({
      value: '%1',
    }),
    args0: [
      {
        type: 'input_value',
        name: 'value',
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockLogValueTooltip(),
    helpUrl: '',
  },
  generator: block =>
    `Sequencer.logValue(${Blockly.JavaScript.valueToCode(
      block,
      'value',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    )});`,
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
    extensions: [FIELD_PATTERNS_VALIDATOR],
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

export const setEffect = {
  definition: {
    type: BlockTypes.SET_EFFECT,
    message0: musicI18n.blockly_blockSetEffect({
      effect: '%1',
      value: '%2',
    }),
    args0: [
      {
        type: 'field_dropdown',
        name: FIELD_EFFECTS_NAME,
        options: FIELD_EFFECT_NAME_OPTIONS,
      },
      {
        // This input is replaced with a field_dropdown by the extension
        type: 'input_dummy',
        name: FIELD_EFFECTS_VALUE,
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockSetEffectTooltip(),
    helpUrl: '',
    extensions: [FIELD_EFFECTS_EXTENSION],
  },
  generator: block => {
    const effectName = block.getFieldValue(FIELD_EFFECTS_NAME);
    const effectValue = block.getFieldValue(FIELD_EFFECTS_VALUE);
    return `Sequencer.setEffect('${effectName}', '${effectValue}');`;
  },
};

/*
export const createInput = {
  definition: {
    type: BlockTypes.LOG_VALUE,
    message0: musicI18n.blockly_blockCreateInput({
      value: 'Create input with ID %1 at %2, %3',
    }),
    args0: [
      {
        type: 'input_value',
        name: 'id',
      },
      {
        type: 'input_value',
        name: 'row',
      },
      {
        type: 'input_value',
        name: 'col',
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockLogValueTooltip(),
    helpUrl: '',
  },
  generator: block =>
    `Sequencer.creaetInput(${Blockly.JavaScript.valueToCode(
      block,
      'value',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    )});`,
};
*/

export const getInputValue = {
  definition: {
    type: BlockTypes.GET_INPUT_VALUE,
    message0: musicI18n.blockly_blockSetInputValue({
      id: '%1',
    }),
    args0: [
      {
        type: 'field_input',
        name: 'id',
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockLogValueTooltip(),
    helpUrl: '',
    output: 'Number',
  },
  generator: block => [
    `Dials.getInputValue("${block.getFieldValue('id')}")`,
    Order.NONE,
  ],
};

export const getOutputValue = {
  definition: {
    type: BlockTypes.GET_OUTPUT_VALUE,
    message0: musicI18n.blockly_blockGetOutputValue({
      id: '%1',
    }),
    args0: [
      {
        type: 'field_input',
        name: 'id',
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockLogValueTooltip(),
    helpUrl: '',
    output: 'Number',
  },
  generator: block => [
    `Dials.getOutputValue("${block.getFieldValue('id')}")`,
    Order.NONE,
  ],
};

export const setOutputValue = {
  definition: {
    type: BlockTypes.SET_OUTPUT_VALUE,
    message0: musicI18n.blockly_blockSetOutputValue({
      outputId: '%1',
      value: '%2',
    }),
    args0: [
      {
        type: 'field_input',
        name: 'outputId',
        text: 'default text',
        spellcheck: false,
      },
      {
        type: 'input_value',
        name: 'value',
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockLogValueTooltip(),
    helpUrl: '',
  },
  generator: block =>
    /*
    `Sequencer.setOutputValue(${Blockly.JavaScript.valueToCode(
      block,
      'outputId',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    )});`,*/
    `Dials.setOutputValue("${block.getFieldValue(
      'outputId'
    )}", ${Blockly.JavaScript.valueToCode(
      block,
      'value',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    )});`,
};
