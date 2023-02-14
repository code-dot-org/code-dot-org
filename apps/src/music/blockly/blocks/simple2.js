import {BlockTypes} from '../blockTypes';
import Globals from '../../globals';
import {
  DEFAULT_SOUND,
  TRIGGER_FIELD,
  DYNAMIC_TRIGGER_EXTENSION,
  FIELD_SOUNDS_NAME,
  FIELD_SOUNDS_TYPE
} from '../constants';

// Some helpers used when generating code to be used by the interpreter.
// Called by executeSong().
export class GeneratorHelpersSimple2 {
  // Given the function's name and body code, this returns the
  // code for the function's implementation.  All functions
  // in this model play sounds sequentially by default.
  static getFunctionImplementation(functionName, functionCode) {
    return `function ${functionName}() {
      ProgramSequencer.playSequential();
      ${functionCode}
      ProgramSequencer.endSequential();
    }
    `;
  }

  // Given a block of code with function calls, and also function implementations,
  // this returns the implementation of the when_run block to be used when the user
  // didn't provide their own implementation.  In this implementation, all of the
  // provided functions are called immediately, simulating tracks mode.
  static getDefaultWhenRunImplementation(
    functionCallsCode,
    functionImplementationsCode
  ) {
    return `
    var __insideWhenRun = true;
    ProgramSequencer.init();
    ProgramSequencer.playTogether();
    ${functionCallsCode}
    ${functionImplementationsCode}
  `;
  }
}

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
    extensions: [DYNAMIC_TRIGGER_EXTENSION]
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
        type: FIELD_SOUNDS_TYPE,
        name: FIELD_SOUNDS_NAME,
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
        "${block.getFieldValue(FIELD_SOUNDS_NAME)}",
        ProgramSequencer.getCurrentMeasure(),
        __insideWhenRun
      );
      ProgramSequencer.updateMeasureForPlayByLength(
        MusicPlayer.getLengthForId(
          "${block.getFieldValue(FIELD_SOUNDS_NAME)}"
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
