import {BlockTypes} from '../blockTypes';
import {getStaticFilePath} from '@cdo/apps/music/utils';
import {PLAY_ICON} from '@cdo/apps/music/constants';

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
        type: 'field_pitch', //'field_generic',
        name: 'sample'
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

