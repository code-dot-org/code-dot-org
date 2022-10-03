import {BlockTypes} from '../blockTypes';

export const playSound = {
  definition: {
    type: BlockTypes.PLAY_SOUND,
    message0: '%1 play %2 at measure %3',
    args0: [
      {
        type: 'field_image',
        src: 'https://code.org/shared/images/play-button.png',
        width: 15,
        height: 20,
        alt: '*',
        flipRtl: false
      },
      {
        type: 'input_dummy',
        name: 'sound'
      },
      {
        type: 'input_value',
        name: 'measure'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'play sound',
    helpUrl: '',
    extensions: ['dynamic_menu_extension']
  },
  generator: ctx =>
    'MusicPlayer.playSoundAtMeasureById("' +
    ctx.getFieldValue('sound') +
    '", ' +
    Blockly.JavaScript.valueToCode(
      ctx,
      'measure',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    ) +
    ');\n'
};

export const playSample = {
  definition: {
    type: BlockTypes.PLAY_SAMPLE,
    message0: '%1 play %2 at measure %3',
    args0: [
      {
        type: 'field_image',
        src: 'https://code.org/shared/images/play-button.png',
        width: 15,
        height: 20,
        alt: '*',
        flipRtl: false
      },
      {
        type: 'input_value',
        name: 'sample',
        check: 'Sample'
      },
      {
        type: 'input_value',
        name: 'measure'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'play sound',
    helpUrl: ''
  },
  generator: ctx =>
    'MusicPlayer.playSoundAtMeasureByName("' +
    Blockly.JavaScript.valueToCode(
      ctx,
      'sample',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    ) +
    '", ' +
    Blockly.JavaScript.valueToCode(
      ctx,
      'measure',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    ) +
    ');\n'
};

export const sample = {
  definition: {
    type: BlockTypes.SAMPLE,
    message0: '%1',
    args0: [
      {
        type: 'field_label_serializable',
        name: 'sample'
      }
    ],
    output: 'Sample',
    colour: 42
  },
  generator: ctx => [
    ctx.getFieldValue('sample'),
    Blockly.JavaScript.ORDER_ATOMIC
  ]
};
