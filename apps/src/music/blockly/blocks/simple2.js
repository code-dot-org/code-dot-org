import musicI18n from '../../locale';
import {BlockTypes} from '../blockTypes';
import {getCodeForSingleBlock} from '../blockUtils';
import {
  TRIGGER_FIELD,
  FIELD_SOUNDS_NAME,
  FIELD_PATTERN_NAME,
  FIELD_PATTERN_AI_NAME,
  FIELD_REST_DURATION_NAME,
  FIELD_EFFECTS_NAME,
  FIELD_EFFECTS_VALUE,
  FIELD_CHORD_NAME,
  FIELD_TUNE_NAME,
  DOCS_BASE_URL,
  FIELD_TRIGGER_START_NAME,
  TriggerStart,
  FIELD_EFFECTS_EXTENSION,
  FIELD_EFFECT_NAME_OPTIONS,
  FIELD_SOUNDS_VALIDATOR,
} from '../constants';
import {
  fieldSoundsDefinition,
  fieldPatternDefinition,
  fieldPatternAiDefinition,
  fieldRestDurationDefinition,
  fieldChordDefinition,
  fieldTuneDefinition,
  fieldTriggerDefinition,
} from '../fields';

export const whenRunSimple2 = {
  definition: {
    type: BlockTypes.WHEN_RUN_SIMPLE2,
    message0: musicI18n.blockly_blockWhenRun(),
    inputsInline: true,
    nextStatement: null,
    style: 'setup_blocks',
    tooltip: musicI18n.blockly_blockWhenRunTooltip(),
    helpUrl: '',
  },
  generator: ctx => {
    const nextBlock = ctx.nextConnection && ctx.nextConnection.targetBlock();
    let handlerCode = Blockly.JavaScript.blockToCode(nextBlock, false);
    ctx.skipNextBlockGeneration = true;
    return `
      if (__context == 'when_run') {
        Sequencer.newSequence();
        Sequencer.startFunctionContext('when_run');
        Sequencer.playSequential();
        ${handlerCode}
      }`;
  },
};

export const triggeredAtSimple2 = {
  definition: {
    type: BlockTypes.TRIGGERED_AT_SIMPLE2,
    message0: musicI18n.blockly_blockTriggered({trigger: '%1', when: '%2'}),
    args0: [
      fieldTriggerDefinition,
      {
        type: 'field_dropdown',
        name: FIELD_TRIGGER_START_NAME,
        options: [
          [
            musicI18n.blockly_fieldTriggerStartImmediately(),
            TriggerStart.IMMEDIATELY,
          ],
          [
            musicI18n.blockly_fieldTriggerStartNextBeat(),
            TriggerStart.NEXT_BEAT,
          ],
          [
            musicI18n.blockly_fieldTriggerStartNextMeasure(),
            TriggerStart.NEXT_MEASURE,
          ],
        ],
      },
    ],
    inputsInline: true,
    nextStatement: null,
    style: 'event_blocks',
    tooltip: musicI18n.blockly_blockTriggeredTooltip(),
    helpUrl: DOCS_BASE_URL + 'trigger',
  },
  generator: ctx => {
    const id = ctx.getFieldValue(TRIGGER_FIELD);
    const nextBlock = ctx.nextConnection && ctx.nextConnection.targetBlock();
    let handlerCode = Blockly.JavaScript.blockToCode(nextBlock, false);
    ctx.skipNextBlockGeneration = true;
    return `
      if (__context == "${id}") {
        Sequencer.newSequence(startPosition, true);
        Sequencer.startFunctionContext('${id}');
        Sequencer.playSequential();
        ${handlerCode}
      }`;
  },
};

export const playSoundAtCurrentLocationSimple2 = {
  definition: {
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2,
    message0: musicI18n.blockly_blockPlaySound({sound: '%1'}),
    args0: [fieldSoundsDefinition],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockPlaySoundTooltip(),
    helpUrl: DOCS_BASE_URL + 'play_sample',
    extensions: [FIELD_SOUNDS_VALIDATOR],
  },
  generator: block =>
    `Sequencer.playSound("${block.getFieldValue(FIELD_SOUNDS_NAME)}", "${
      block.id
    }");\n`,
};

export const playPatternAtCurrentLocationSimple2 = {
  definition: {
    type: BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2,
    message0: musicI18n.blockly_blockPlayPattern({pattern: '%1'}),
    args0: [fieldPatternDefinition],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockPlayPatternTooltip(),
    helpUrl: DOCS_BASE_URL + 'play_pattern',
  },
  generator: block =>
    `Sequencer.playPattern(${JSON.stringify(
      block.getFieldValue(FIELD_PATTERN_NAME)
    )}, "${block.id}");`,
};

export const playPatternAiAtCurrentLocationSimple2 = {
  definition: {
    type: BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2,
    message0: musicI18n.blockly_blockPlayPatternAi({bot: '%1', pattern: '%2'}),
    args0: [
      {
        type: 'field_image',
        src: '/blockly/media/ai-bot-mini-2.svg',
        width: 24,
        height: 24,
        alt: '',
      },
      fieldPatternAiDefinition,
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockPlayPatternAiTooltip(),
    helpUrl: DOCS_BASE_URL + 'play_pattern_ai',
  },
  generator: block =>
    `Sequencer.playPattern(${JSON.stringify(
      block.getFieldValue(FIELD_PATTERN_AI_NAME)
    )}, "${block.id}");`,
};

export const playChordAtCurrentLocationSimple2 = {
  definition: {
    type: BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2,
    message0: musicI18n.blockly_blockPlayChord({chord: '%1'}),
    args0: [fieldChordDefinition],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockPlayChordTooltip(),
    helpUrl: DOCS_BASE_URL + 'play_keys',
  },
  generator: block =>
    `Sequencer.playChord(${JSON.stringify(
      block.getFieldValue(FIELD_CHORD_NAME)
    )},  "${block.id}");`,
};

export const playTuneAtCurrentLocationSimple2 = {
  definition: {
    type: BlockTypes.PLAY_TUNE_AT_CURRENT_LOCATION_SIMPLE2,
    message0: musicI18n.blockly_blockPlayTune({tune: '%1'}),
    args0: [fieldTuneDefinition],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockPlayTuneTooltip(),
    helpUrl: DOCS_BASE_URL + 'play_tune',
  },
  generator: block =>
    `Sequencer.playTune(${JSON.stringify(
      block.getFieldValue(FIELD_TUNE_NAME)
    )},  "${block.id}");`,
};

export const playRestAtCurrentLocationSimple2 = {
  definition: {
    type: BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2,
    message0: musicI18n.blockly_blockRest({duration: '%1'}),
    args0: [fieldRestDurationDefinition],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockRestTooltip(),
    helpUrl: DOCS_BASE_URL + 'rest',
  },
  generator: block =>
    `Sequencer.rest(${block.getFieldValue(FIELD_REST_DURATION_NAME)});`,
};

export const setEffectAtCurrentLocationSimple2 = {
  definition: {
    type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
    message0: musicI18n.blockly_blockSetEffect({effect: '%1', value: '%2'}),
    args0: [
      {
        type: 'field_dropdown',
        name: FIELD_EFFECTS_NAME,
        options: FIELD_EFFECT_NAME_OPTIONS,
      },
      {
        // This input is replaced with a field_dropdown by the extension
        type: 'input_dummy',
        name: FIELD_EFFECTS_VALUE,
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockSetEffectTooltip(),
    helpUrl: DOCS_BASE_URL + 'set_effect',
    extensions: [FIELD_EFFECTS_EXTENSION],
  },
  generator: block => {
    const effectName = block.getFieldValue(FIELD_EFFECTS_NAME);
    const effectValue = block.getFieldValue(FIELD_EFFECTS_VALUE);
    return `Sequencer.setEffect('${effectName}', '${effectValue}');`;
  },
};

export const playSoundsTogether = {
  definition: {
    type: BlockTypes.PLAY_SOUNDS_TOGETHER,
    message0: musicI18n.blockly_blockPlaySoundsTogether(),
    args0: [],
    message1: '%1',
    args1: [
      {
        type: 'input_statement',
        name: 'code',
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'logic_blocks',
    tooltip: musicI18n.blockly_blockPlaySoundsTogether(),
    helpUrl: DOCS_BASE_URL + 'play_together',
  },
  generator: block =>
    ` Sequencer.playTogether();
      ${Blockly.JavaScript.statementToCode(block, 'code')}
      Sequencer.endTogether();
    `,
};

export const playSoundsTogetherNoNext = {
  ...playSoundsTogether,
  definition: {
    ...playSoundsTogether.definition,
    type: BlockTypes.PLAY_SOUNDS_TOGETHER_NO_NEXT,
    nextStatement: undefined,
  },
};

export const playSoundsSequential = {
  definition: {
    type: BlockTypes.PLAY_SOUNDS_SEQUENTIAL,
    message0: musicI18n.blockly_blockPlaySoundsSequential(),
    args0: [],
    message1: '%1',
    args1: [
      {
        type: 'input_statement',
        name: 'code',
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'logic_blocks',
    tooltip: musicI18n.blockly_blockPlaySoundsSequentialTooltip(),
    helpUrl: DOCS_BASE_URL + 'play_sequential',
  },
  generator: block =>
    ` Sequencer.playSequential();
      ${Blockly.JavaScript.statementToCode(block, 'code')}
      Sequencer.endSequential();
      `,
};

export const playSoundsRandom = {
  definition: {
    type: BlockTypes.PLAY_SOUNDS_RANDOM,
    message0: musicI18n.blockly_blockPlaySoundsRandom(),
    args0: [],
    message1: '%1',
    args1: [
      {
        type: 'input_statement',
        name: 'code',
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'logic_blocks',
    tooltip: musicI18n.blockly_blockPlaySoundsRandomTooltip(),
    helpUrl: DOCS_BASE_URL + 'play_random',
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
  },
};

export const repeatSimple2 = {
  definition: {
    type: BlockTypes.REPEAT_SIMPLE2,
    message0: Blockly.Msg['CONTROLS_REPEAT_TITLE'],
    args0: [
      {
        type: 'field_number',
        name: 'times',
        value: 1,
        min: 0,
        max: 100,
      },
    ],
    message1: `${Blockly.Msg['CONTROLS_REPEAT_INPUT_DO']} %1`,
    args1: [
      {
        type: 'input_statement',
        name: 'code',
      },
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'loop_blocks',
    tooltip: Blockly.Msg['CONTROLS_REPEAT_TOOLTIP'],
    helpUrl: DOCS_BASE_URL + 'repeat',
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
  },
};
