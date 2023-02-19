import {BlockTypes} from '../blockTypes';
import Globals from '../../globals';
import {
  TRIGGER_FIELD,
  DYNAMIC_TRIGGER_EXTENSION,
  FIELD_SOUNDS_NAME,
  FIELD_SOUNDS_TYPE
} from '../constants';
import {DEFAULT_SOUND} from '../../constants';

// Some helpers used when generating code to be used by the interpreter.
// Called by executeSong().
export class GeneratorHelpersSimple2 {
  // Given the function's name and body code, this returns the
  // code for the function's implementation.  All functions
  // in this model play sounds sequentially by default.
  static getFunctionImplementation(functionName, functionCode) {
    const actualFunctionName = this.getSafeFunctionName(functionName);
    return `function ${actualFunctionName}() {
      var __currentFunction = {
        name: '${functionName}',
        uniqueInvocationId: MusicPlayer.getUniqueInvocationId()
      };
      var __effects = {};
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
    var __currentFunction = {
      name: 'when_run',
      uniqueInvocationId: MusicPlayer.getUniqueInvocationId()
    };
    var __effects = {};
    ProgramSequencer.init();
    ProgramSequencer.playTogether();
    ${functionCallsCode}
    ${functionImplementationsCode}
  `;
  }

  // Return a function name in JavaScript.
  // Adapted from Blockly.JavaScript.nameDB_.safeName_
  // at https://github.com/google/blockly/blob/498766b930287ab8ef86accf95e9453018997461/core/names.ts
  static getSafeFunctionName(functionName) {
    // Unfortunately names in non-latin characters will look like
    // _E9_9F_B3_E4_B9_90 which is pretty meaningless.
    // https://github.com/google/blockly/issues/1654
    let name = encodeURI(functionName.replace(/ /g, '_')).replace(
      /[^\w]/g,
      '_'
    );
    // Most languages don't allow names with leading numbers.
    if ('0123456789'.indexOf(name[0]) !== -1) {
      name = 'my_' + name;
    }
    return name;
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
      var __currentFunction = {
        name: 'when_run',
        uniqueInvocationId: MusicPlayer.getUniqueInvocationId()
      };
      var __effects = {};
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
  generator: () =>
    ` var __insideWhenRun = false;
      ProgramSequencer.playSequentialWithMeasure(
        Math.ceil(
          MusicPlayer.getCurrentPlayheadPosition()
        )
      );
    `
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
        __insideWhenRun,
        null,
        __currentFunction,
        __effects
      );
      ProgramSequencer.updateMeasureForPlayByLength(
        MusicPlayer.getLengthForId(
          "${block.getFieldValue(FIELD_SOUNDS_NAME)}"
        )
      );
    `
};

export const playRestAtCurrentLocationSimple2 = {
  definition: {
    type: BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2,
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
    style: 'music_blocks',
    tooltip: 'rest',
    helpUrl: ''
  },
  generator: block =>
    `
      ProgramSequencer.updateMeasureForPlayByLength(
        ${Blockly.JavaScript.valueToCode(
          block,
          'measures',
          Blockly.JavaScript.ORDER_ASSIGNMENT
        )}
      );
    `
};

export const setEffectAtCurrentLocationSimple2 = {
  definition: {
    type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
    message0: 'set effect %1 at current measure',
    args0: [
      {
        type: 'field_dropdown',
        name: 'EFFECT',
        options: [
          ['low volume', 'volume_low'],
          ['normal volume', 'volume_normal'],
          ['some filtering', 'filter_on'],
          ['no filtering', 'filter_off']
        ]
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'music_blocks',
    tooltip: 'set effect',
    helpUrl: ''
  },
  generator: block => {
    const fieldValues = block.getFieldValue('EFFECT').split('_');
    const effectName = fieldValues[0];
    const effectValue = fieldValues[1];
    return `
      __effects.${effectName} = '${effectValue}';
    `;
  }
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
