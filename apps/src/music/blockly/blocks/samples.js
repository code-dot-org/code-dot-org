import {BlockTypes} from '../blockTypes';
import Globals from '../../globals';

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
    message0: 'play %1 at measure %2',
    args0: [
      {
        type: 'field_sounds',
        name: 'sound',
        getLibrary: () => Globals.getLibrary(),
        playPreview: (id, onStop) => {
          Globals.getPlayer().previewSound(id, onStop);
        },
        currentValue: 'pop/cafe_beat'
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

export const newTrack = {
  definition: {
    type: BlockTypes.NEW_TRACK,
    message0: 'new track %1 at measure %2',
    args0: [
      {
        type: 'input_value',
        name: 'trackName'
      },
      {
        type: 'input_value',
        name: 'measure'
      }
    ],
    message1: '%1',
    args1: [
      {
        type: 'input_statement',
        name: 'trackCode'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 150
  },
  generator: ctx => {
    const trackName = Blockly.JavaScript.valueToCode(
      ctx,
      'trackName',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    );
    const measure = Blockly.JavaScript.valueToCode(
      ctx,
      'measure',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    );
    let trackCode = Blockly.JavaScript.statementToCode(ctx, 'trackCode');
    return `MusicPlayer.startTrack(${trackName}, ${measure}, ${
      isBlockInsideWhenRun(ctx) ? 'true' : 'false'
    });
    ${trackCode}
    MusicPlayer.finishTrack();`;
    // return `MusicPlayer.playTrack(${trackName}, ${measure}, ${
    //   isBlockInsideWhenRun(ctx) ? 'true' : 'false'
    // }, [${soundsToPlay}]);`;
  }
};

export const playSoundInTrack = {
  definition: {
    type: BlockTypes.PLAY_SOUND_IN_TRACK,
    message0: 'play %1',
    args0: [
      {
        type: 'field_sounds',
        name: 'sound',
        getLibrary: () => Globals.getLibrary(),
        playPreview: (id, onStop) => {
          Globals.getPlayer().previewSound(id, onStop);
        },
        currentValue: 'pop/cafe_beat'
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
    `MusicPlayer.addSoundToCurrentTrack('${ctx.getFieldValue('sound')}');`
};

export const restInTrack = {
  definition: {
    type: BlockTypes.REST_IN_TRACK,
    message0: 'rest for %1 measures',
    args0: [
      {
        type: 'input_value',
        name: 'measures'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 50
  },
  generator: ctx =>
    `MusicPlayer.restInCurrentTrack(${Blockly.JavaScript.valueToCode(
      ctx,
      'measures',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    )});`
};
