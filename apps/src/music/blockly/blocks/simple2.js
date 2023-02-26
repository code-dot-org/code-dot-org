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
    var __skipSound = false;
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
      var __skipSound = false;
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
  generator: block =>
    ` var __insideWhenRun = false;
      var __currentFunction = {
        name: '${block.getFieldValue(TRIGGER_FIELD)}',
        uniqueInvocationId: MusicPlayer.getUniqueInvocationId()
      };
      var __skipSound = false;
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
      if (!__skipSound) {
        MusicPlayer.playSoundAtMeasureById(
          "${block.getFieldValue(FIELD_SOUNDS_NAME)}",
          ProgramSequencer.getCurrentMeasure(),
          __insideWhenRun,
          null,
          __currentFunction
        );
      }
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
    style: 'flow_blocks',
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

    const randomVar = Blockly.JavaScript.nameDB_.getDistinctName(
      'random',
      Blockly.Names.NameType.VARIABLE
    );

    let code = `var ${randomVar} = Math.floor(Math.random() * ${
      resultArray.length
    });`;

    for (const [resultIndex, result] of resultArray.entries()) {
      const lastSkipSoundVar = Blockly.JavaScript.nameDB_.getDistinctName(
        '__lastSkipSound',
        Blockly.Names.NameType.VARIABLE
      );
      code += `
        ${lastSkipSoundVar} = __skipSound;
        __skipSound = __skipSound || ${randomVar} !== ${resultIndex};
        ${result}
        __skipSound = ${lastSkipSoundVar};
        `;
    }

    return ` ProgramSequencer.playTogether();
      ${code}
      ProgramSequencer.endTogether();
      `;
  }
};

/**
 * Generate code for the specified block but not following blocks.
 * Adapted from this thread: https://groups.google.com/g/blockly/c/uXewhtr-mvM
 * @param {Blockly.Block} block The block to generate code for.
 * @return {string|!Array} For statement blocks, the generated code.
 *     For value blocks, an array containing the generated code and an
 *     operator order value.  Returns '' if block is null.
 */
function getCodeForSingleBlock(block) {
  if (!block) {
    return '';
  }
  if (block.disabled) {
    // Skip past this block if it is disabled.
    return getCodeForSingleBlock(block.getNextBlock());
  }

  var func = Blockly.JavaScript[block.type];
  if (typeof func !== 'function') {
    throw Error(
      'Language "JavaScript" does not know how to generate ' +
        'code for block type: ' +
        block.type
    );
  }
  // First argument to func.call is the value of 'this' in the generator.
  // Prior to 24 September 2013 'this' was the only way to access the block.
  // The current preferred method of accessing the block is through the second
  // argument to func.call, which becomes the first parameter to the generator.
  var code = func.call(block, block);
  if (Array.isArray(code)) {
    // Value blocks return tuples of code and operator order.
    if (!block.outputConnection) {
      throw Error('Expecting string from statement block: ' + block.type);
    }
    return [code[0], code[1]];
  } else if (typeof code === 'string') {
    //var id = block.id.replace(/\$/g, '$$$$'); // Issue 251.
    //if (this.STATEMENT_PREFIX) {
    //  code = this.STATEMENT_PREFIX.replace(/%1/g, "'" + id + "'") + code;
    //}
    return code;
  } else if (code === null) {
    // Block has handled code generation itself.
    return '';
  } else {
    throw Error('Invalid code generated: ' + code);
  }
}

export const repeatSimple2 = {
  definition: {
    type: BlockTypes.REPEAT_SIMPLE2,
    message0: 'repeat %1 times',
    args0: [
      {
        type: 'input_value',
        name: 'times'
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
    const repeats =
      Blockly.JavaScript.valueToCode(
        block,
        'times',
        Blockly.JavaScript.ORDER_ASSIGNMENT
      ) || 0;

    let branch = Blockly.JavaScript.statementToCode(block, 'code');
    branch = Blockly.JavaScript.addLoopTrap(branch, block);
    let code = '';
    const loopVar = Blockly.JavaScript.nameDB_.getDistinctName(
      'count',
      Blockly.Names.NameType.VARIABLE
    );
    let endVar = repeats;
    if (!repeats.match(/^\w+$/) && !Blockly.utils.string.isNumber(repeats)) {
      endVar = Blockly.JavaScript.nameDB_.getDistinctName(
        'repeat_end',
        Blockly.Names.NameType.VARIABLE
      );
      code += 'var ' + endVar + ' = ' + repeats + ';\n';
    }
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
      ProgramSequencer.playSequential();
      ${code}
      ProgramSequencer.endSequential();
      `;
  }
};
