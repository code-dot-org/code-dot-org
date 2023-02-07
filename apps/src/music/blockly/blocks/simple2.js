import {BlockTypes} from '../blockTypes';
import Globals from '../../globals';

// Examine chain of parents to see if one is 'when_run'.
const isBlockInsideWhenRun = ctx => {
  // Since this model doesn't currently support triggered code, then
  // everything is ultimately called from under when_run.
  return true;
};

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
    `
      ProgramSequencer.init();
      ProgramSequencer.playSequential();
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
    `
      MusicPlayer.playSoundAtMeasureById(
        "${ctx.getFieldValue('sound')}",
        ProgramSequencer.getCurrentMeasure(),
        ${isBlockInsideWhenRun(ctx) ? 'true' : 'false'}
      );
      ProgramSequencer.updateMeasureForPlayByLength(
        MusicPlayer.getLengthForId(
          "${ctx.getFieldValue('sound')}"
        )
      );
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
    ` ProgramSequencer.playTogether();
      ${Blockly.JavaScript.statementToCode(ctx, 'code')}
      ProgramSequencer.endTogether();
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
    ` ProgramSequencer.playSequential();
      ${Blockly.JavaScript.statementToCode(ctx, 'code')}
      ProgramSequencer.endSequential();
      `
};
