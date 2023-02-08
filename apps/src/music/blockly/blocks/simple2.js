import {BlockTypes} from '../blockTypes';
import Globals from '../../globals';
import {DEFAULT_SOUND, TRIGGER_FIELD} from '../constants';

export const whenRunSimple2 = {
  definition: {
    type: BlockTypes.WHEN_RUN_SIMPLE2,
    message0: 'when run',
    inputsInline: true,
    nextStatement: null,
    style: 'setup_blocks',
    tooltip: 'when run',
    helpUrl: ''
  },
  generator: () =>
    `
      var __insideWhenRun = true;
      ProgramSequencer.init();
      ProgramSequencer.playSequential();
    `
};

export const triggeredAtSimple2 = {
  definition: {
    type: BlockTypes.TRIGGERED_AT_SIMPLE2,
    message0: '%1 triggered',
    args0: [
      {
        type: 'input_dummy',
        name: TRIGGER_FIELD
      }
    ],
    inputsInline: true,
    nextStatement: null,
    style: 'event_blocks',
    tooltip: 'at trigger',
    extensions: ['dynamic_trigger_extension']
  },
  generator: block => {
    const varName = Blockly.JavaScript.nameDB_.getDistinctName(
      'eventTime',
      Blockly.Names.NameType.VARIABLE
    );
    return `
        var __insideWhenRun = false;
        ${varName} = MusicPlayer.getPlayheadPosition();
        currentMeasureLocation = Math.ceil(${varName});
        ProgramSequencer.playSequentialWithMeasure(currentMeasureLocation);
      `;
  }
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
        currentValue: DEFAULT_SOUND
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'music_blocks',
    tooltip: 'play sound',
    helpUrl: ''
  },
  generator: block =>
    `
      MusicPlayer.playSoundAtMeasureById(
        "${block.getFieldValue('sound')}",
        ProgramSequencer.getCurrentMeasure(),
        __insideWhenRun
      );
      ProgramSequencer.updateMeasureForPlayByLength(
        MusicPlayer.getLengthForId(
          "${block.getFieldValue('sound')}"
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
    style: 'flow_blocks',
    tooltip: 'play sounds together',
    helpUrl: ''
  },
  generator: block =>
    ` ProgramSequencer.playTogether();
      ${Blockly.JavaScript.statementToCode(block, 'code')}
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
    style: 'flow_blocks',
    tooltip: 'play sounds sequentially',
    helpUrl: ''
  },
  generator: block =>
    ` ProgramSequencer.playSequential();
      ${Blockly.JavaScript.statementToCode(block, 'code')}
      ProgramSequencer.endSequential();
      `
};
