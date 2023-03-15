import {BlockTypes} from '../blockTypes';
import {
  TRIGGER_FIELD,
  DYNAMIC_TRIGGER_EXTENSION,
  FIELD_SOUNDS_NAME,
  FIELD_PATTERN_NAME,
  FIELD_REST_DURATION_NAME,
  FIELD_EFFECTS_NAME,
  FIELD_EFFECTS_VALUE
} from '../constants';
import {
  fieldSoundsDefinition,
  fieldPatternDefinition,
  fieldRestDurationDefinition
} from '../fields';
import {getCodeForSingleBlock} from '../blockUtils';

// Some helpers used when generating code to be used by the interpreter.
// Called by executeSong().
export class GeneratorHelpersSimple2 {
  // Given the function's name and body code, this returns the
  // code for the function's implementation.  All functions
  // in this model play sounds sequentially by default.
  static getFunctionImplementation(functionName, functionCode) {
    const actualFunctionName = this.getSafeFunctionName(functionName);
    return `function ${actualFunctionName}() {
      Sequencer.startFunctionContext('${functionName}');
      Sequencer.playSequential();
      ${functionCode}
      Sequencer.endSequential();
      Sequencer.endFunctionContext();
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
    Sequencer.reset();
    Sequencer.playTogether();
    Sequencer.startFunctionContext('when_run');
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
      Sequencer.reset();
      Sequencer.startFunctionContext('when_run');
      Sequencer.playSequential();
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
  generator: block =>
    `
      Sequencer.reset(Math.ceil(
        MusicPlayer.getCurrentPlayheadPosition()
      ), true);
      Sequencer.startFunctionContext('${block.getFieldValue(TRIGGER_FIELD)}');
      Sequencer.playSequential();
    `
};

export const playSoundAtCurrentLocationSimple2 = {
  definition: {
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2,
    message0: 'play %1',
    args0: [fieldSoundsDefinition],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: 'play sound',
    helpUrl: ''
  },
  generator: block =>
    `Sequencer.playSound("${block.getFieldValue(FIELD_SOUNDS_NAME)}");`
};

export const playPatternAtCurrentLocationSimple2 = {
  definition: {
    type: BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2,
    message0: 'play pattern %1',
    args0: [fieldPatternDefinition],

    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: 'play pattern',
    helpUrl: ''
  },
  generator: block =>
    `Sequencer.playPattern(${JSON.stringify(
      block.getFieldValue(FIELD_PATTERN_NAME)
    )});`
};

export const playRestAtCurrentLocationSimple2 = {
  definition: {
    type: BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2,
    message0: 'rest for %1',
    args0: [fieldRestDurationDefinition],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: 'rest',
    helpUrl: ''
  },
  generator: block =>
    `Sequencer.rest(${block.getFieldValue(FIELD_REST_DURATION_NAME)})`
};

export const setEffectAtCurrentLocationSimple2 = {
  definition: {
    type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
    message0: 'set %1 to %2',
    args0: [
      {
        type: 'field_dropdown',
        name: FIELD_EFFECTS_NAME,
        options: [
          ['volume', 'volume'],
          ['filter', 'filter'],
          ['delay', 'delay']
        ]
      },
      {
        type: 'field_dropdown',
        name: FIELD_EFFECTS_VALUE,
        options: [['normal', ''], ['medium', 'medium'], ['low', 'low']]
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: 'set effect',
    helpUrl: ''
  },
  generator: block => {
    const effectName = block.getFieldValue(FIELD_EFFECTS_NAME);
    const effectValue = block.getFieldValue(FIELD_EFFECTS_VALUE);
    return `Sequencer.setEffect('${effectName}', '${effectValue}');`;
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
    style: 'logic_blocks',
    tooltip: 'play sounds together',
    helpUrl: ''
  },
  generator: block =>
    ` Sequencer.playTogether();
      ${Blockly.JavaScript.statementToCode(block, 'code')}
      Sequencer.endTogether();
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
    style: 'logic_blocks',
    tooltip: 'play sounds sequentially',
    helpUrl: ''
  },
  generator: block =>
    ` Sequencer.playSequential();
      ${Blockly.JavaScript.statementToCode(block, 'code')}
      Sequencer.endSequential();`
};

export const playSoundsRandom = {
  definition: {
    type: BlockTypes.PLAY_SOUNDS_RANDOM,
    message0: 'play random',
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
    style: 'logic_blocks',
    tooltip: 'play sound randomly',
    helpUrl: ''
  },
  generator: block => {
    const resultArray = [];
    let currentBlock = block.getInputTargetBlock('code');
    while (currentBlock) {
      const codeForBlock = getCodeForSingleBlock(currentBlock);
      resultArray.push(codeForBlock);
      currentBlock = currentBlock.getNextBlock();
    }

    let code = '';
    for (const result of resultArray) {
      code += `
        ${result}
        Sequencer.nextRandom();
        `;
    }

    return `
      Sequencer.playTogether();
      Sequencer.startRandom(${resultArray.length});
      ${code}
      Sequencer.endRandom();
      Sequencer.endTogether();
      `;
  }
};

export const repeatSimple2 = {
  definition: {
    type: BlockTypes.REPEAT_SIMPLE2,
    message0: 'repeat %1 times',
    args0: [
      {
        type: 'field_number',
        name: 'times',
        value: 1,
        min: 0,
        max: 100
      }
    ],
    message1: 'do %1',
    args1: [
      {
        type: 'input_statement',
        name: 'code'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'loop_blocks',
    tooltip: 'repeat',
    helpUrl: ''
  },
  generator: block => {
    const repeats = block.getFieldValue('times');

    let branch = Blockly.JavaScript.statementToCode(block, 'code');
    branch = Blockly.JavaScript.addLoopTrap(branch, block);
    let code = '';
    const loopVar = Blockly.JavaScript.nameDB_.getDistinctName(
      'count',
      Blockly.Names.NameType.VARIABLE
    );
    let endVar = repeats;
    endVar = Blockly.JavaScript.nameDB_.getDistinctName(
      'repeat_end',
      Blockly.Names.NameType.VARIABLE
    );
    code += 'var ' + endVar + ' = ' + repeats + ';\n';
    code +=
      'for (var ' +
      loopVar +
      ' = 0; ' +
      loopVar +
      ' < ' +
      endVar +
      '; ' +
      loopVar +
      '++) {\n' +
      branch +
      '}\n';

    return `
      Sequencer.playSequential();
      ${code}
      Sequencer.endSequential();
      `;
  }
};
