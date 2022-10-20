import {BlockTypes} from '../blockTypes';

// Examine chain of parents to see if one is 'when_run'.
const isBlockInsideWhenRun = ctx => {
  let block = ctx;
  while ((block = block.getParent())) {
    if (block.type === 'when_run') {
      return true;
    }
  }

  return false;
};

export const playSound = {
  definition: {
    type: BlockTypes.PLAY_SOUND,
    message0: '%1 play %2 at measure %3',
    args0: [
      {
        type: 'field_image',
        src: 'https://code.org/shared/images/play-button.png',
        width: 18,
        height: 23,
        alt: '*',
        flipRtl: false,
        name: 'image'
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
    extensions: [
      'dynamic_menu_extension',
      'preview_extension',
      'clear_preview_on_change_extension'
    ]
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
    ', ' +
    (isBlockInsideWhenRun(ctx) ? 'true' : 'false') +
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
    ', ' +
    (isBlockInsideWhenRun(ctx) ? 'true' : 'false') +
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
