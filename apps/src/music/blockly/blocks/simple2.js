import {BlockTypes} from '../blockTypes';
import {getLengthForId} from '../../player/helpers';
import Globals from '../../globals';

// Examine chain of parents to see if one is 'when_run'.
const isBlockInsideWhenRun = ctx => {
  // Since this model doesn't currently support triggered code, then
  // everything is ultimately called from under when_run.
  return true;
};

export const defaultWhenRunSimple2Code = `
  var stack = [];

  function play_sequential() {
    var measure = stack.length == 0 ? 1 : stack[stack.length-1].measure;
    stack.push({measure: measure, together: false});
  }

  function end_sequential() {
    var nextMeasure = stack[stack.length-1].measure;
    stack.pop();

    if (stack.length > 0) {
      // now the frame we are returning to has to absorb this information.
      if (stack[stack.length-1].together) {
        stack[stack.length-1].lastMeasures.push(nextMeasure);
      } else {
        stack[stack.length-1].measure = nextMeasure;
      }
    } else {
      console.log("done");
    }
  }

  function play_together() {
    var nextMeasure = stack.length == 0 ? 1 : stack[stack.length-1].measure;
    stack.push({measure: nextMeasure, together: true, lastMeasures: [nextMeasure]});
  }

  function end_together() {
    var nextMeasure = Math.max.apply(Math, stack[stack.length-1].lastMeasures);

    // we are returning to the previous stack frame.
    stack.pop();

    // now the frame we are returning to has to absorb this information.
    if (stack[stack.length-1].together) {
      stack[stack.length-1].lastMeasures.push(nextMeasure);
    } else {
      stack[stack.length-1].measure = nextMeasure;
    }
  }

  function play_sound(id, length) {
    var playMeasure = stack[stack.length-1].measure;
    console.log('sound:', id, 'at', playMeasure, 'length', length);
    if (stack[stack.length-1].together) {
      stack[stack.length-1].lastMeasures.push(playMeasure + length);
    } else {
      stack[stack.length-1].measure += length;
    }
  }
`;

export const whenRunSimple2 = {
  definition: {
    type: BlockTypes.WHEN_RUN_SIMPLE2,
    message0: 'when run',
    inputsInline: true,
    nextStatement: null,
    colour: 230,
    tooltip: 'when run',
    helpUrl: ''
  },
  generator: () =>
    defaultWhenRunSimple2Code +
    `
    play_sequential();
    `
};

export const playSoundAtCurrentLocationSimple2 = {
  definition: {
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2,
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
    `MusicPlayer.playSoundAtMeasureById(
      "${ctx.getFieldValue('sound')}",
      stack[stack.length - 1].measure,
      ${isBlockInsideWhenRun(ctx) ? 'true' : 'false'}
    );
    if (stack[stack.length-1].together) {
      stack[stack.length-1].lastMeasures.push(
        stack[stack.length-1].measure +
        ${getLengthForId(ctx.getFieldValue('sound'))}
      );
    } else {
      stack[stack.length-1].measure += ${getLengthForId(
        ctx.getFieldValue('sound')
      )};
    }
    `
};

export const playSoundsTogether = {
  definition: {
    type: BlockTypes.PLAY_SOUNDS_TOGETHER,
    message0: 'play together',
    args0: [],
    message1: '%1',
    args1: [
      {
        type: 'input_statement',
        name: 'code'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'play sounds together',
    helpUrl: ''
  },
  generator: ctx =>
    `play_together();
      ${Blockly.JavaScript.statementToCode(ctx, 'code')}
      end_together();
      `
};

export const playSoundsSequential = {
  definition: {
    type: BlockTypes.PLAY_SOUNDS_SEQUENTIAL,
    message0: 'play sequential',
    args0: [],
    message1: '%1',
    args1: [
      {
        type: 'input_statement',
        name: 'code'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'play sounds sequentially',
    helpUrl: ''
  },
  generator: ctx =>
    `play_sequential();
      ${Blockly.JavaScript.statementToCode(ctx, 'code')}
      end_sequential();
      `
};
