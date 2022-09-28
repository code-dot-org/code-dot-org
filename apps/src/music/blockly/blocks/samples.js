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
    'MusicPlayer.playSoundAtMeasure("' +
    ctx.getFieldValue('sound') +
    '", ' +
    Blockly.JavaScript.valueToCode(
      ctx,
      'measure',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    ) +
    ');\n'
};

export const playSoundNextMeasure = {
  definition: {
    type: BlockTypes.PLAY_SOUND_NEXT_MEASURE,
    message0: '%1 play %2 at next measure',
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
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'play sound at next measure',
    helpUrl: '',
    extensions: ['dynamic_menu_extension']
  },
  generator: ctx =>
    'MusicPlayer.playSoundAtMeasure("' + ctx.getFieldValue('sound') + '");\n'
};
