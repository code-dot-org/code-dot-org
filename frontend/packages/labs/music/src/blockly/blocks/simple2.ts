import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import type {Environment} from '@code-dot-org/blockly-workspace';
import {defineBlock} from '@code-dot-org/blockly-workspace';

import imgAiBot from '../../assets/ai/ai-bot-mini-2.svg';

import {MAX_LOOP_ITERATIONS_COUNT} from '../../constants';

import {BlockTypes} from '../blockTypes';
import {getCodeForSingleBlock} from '../blockUtils';
import {
  TriggerStart,
  DOCS_BASE_URL,
  FIELD_CHORD_NAME,
  FIELD_EFFECT_NAME_OPTIONS,
  FIELD_EFFECTS_NAME,
  FIELD_EFFECTS_VALUE,
  FIELD_PATTERN_NAME,
  FIELD_PATTERN_AI_NAME,
  FIELD_REST_DURATION_NAME,
  FIELD_SOUNDS_NAME,
  FIELD_TRIGGER_START_NAME,
  FIELD_TUNE_NAME,
  TRIGGER_FIELD,
} from '../constants';
import {nextConnectionMutator} from '../extensions/nextConnectionMutator';
import {fieldEffectsExtension} from '../extensions/fieldEffectsExtension';
import {fieldSoundsValidatorExtension} from '../extensions/fieldSoundsValidatorExtension';
import {fieldPatternsValidatorExtension} from '../extensions/fieldPatternsValidatorExtension';
import {
  fieldChordDefinition,
  fieldPatternDefinition,
  fieldPatternAiDefinition,
  fieldRestDurationDefinition,
  fieldSoundsDefinition,
  fieldTriggerDefinition,
  fieldTuneDefinition,
} from '../fields';

interface MusicLabEnvironment extends Environment {
  /** Which top block is current generating */
  generating?: string;
}

const whenRunSimple2 = defineBlock({
  type: BlockTypes.WHEN_RUN_SIMPLE2,
  message0: 'when run',
  inputsInline: true,
  nextStatement: true,
  style: 'setup_blocks',
  tooltip: 'when run',
  helpUrl: '',
  generator: {
    javascript(block, javascriptGenerator, environment: MusicLabEnvironment) {
      environment.generating = block.id;
      const nextBlock =
        block.nextConnection && block.nextConnection.targetBlock();
      const handlerCode = javascriptGenerator.blockToCode(nextBlock, false);
      environment.generating = undefined;

      return `
      if (__context == 'when_run') {
        Sequencer.newSequence();
        Sequencer.startFunctionContext('when_run');
        Sequencer.playSequential();
        ${handlerCode}
      }`;
    },
  },
});

const triggeredAtSimple2 = defineBlock({
  type: BlockTypes.TRIGGERED_AT_SIMPLE2,
  message0: 'when %1 triggered %2 do',
  args0: [
    fieldTriggerDefinition,
    {
      type: 'field_dropdown',
      name: FIELD_TRIGGER_START_NAME,
      options: [
        ['immediately', TriggerStart.IMMEDIATELY],
        ['at next beat', TriggerStart.NEXT_BEAT],
        ['at next measure', TriggerStart.NEXT_MEASURE],
      ],
    },
  ],
  inputsInline: true,
  nextStatement: true,
  style: 'event_blocks',
  tooltip: 'at trigger',
  helpUrl: DOCS_BASE_URL + 'trigger',
  generator: {
    javascript(block, javascriptGenerator, environment: MusicLabEnvironment) {
      if (!environment.generating) {
        // Ignore generating unless it is within a top block
        return '';
      }

      const id = block.getFieldValue(TRIGGER_FIELD);
      const nextBlock =
        block.nextConnection && block.nextConnection.targetBlock();
      const handlerCode = javascriptGenerator.blockToCode(nextBlock, false);
      return `
        if (__context == "${id}") {
          Sequencer.newSequence(startPosition, true);
          Sequencer.startFunctionContext('${id}');
          Sequencer.playSequential();
          ${handlerCode}
        }`;
    },
  },
});

const playSoundAtCurrentLocationSimple2 = defineBlock({
  type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2,
  message0: 'play %1',
  args0: [fieldSoundsDefinition],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'lab_blocks',
  tooltip: 'play sound',
  helpUrl: DOCS_BASE_URL + 'play_sample',
  extensions: [fieldSoundsValidatorExtension],
  mutator: nextConnectionMutator,
  generator: {
    javascript(block, _javascriptGenerator, environment: MusicLabEnvironment) {
      if (!environment.generating) {
        // Ignore generating unless it is within a top block
        return '';
      }

      return `Sequencer.playSound("${block.getFieldValue(FIELD_SOUNDS_NAME)}", "${
        block.id
      }");\n`;
    },
  },
});

const playPatternAtCurrentLocationSimple2 = defineBlock({
  type: BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2,
  message0: 'play drums %1',
  args0: [fieldPatternDefinition],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'lab_blocks',
  tooltip: 'play drums',
  helpUrl: DOCS_BASE_URL + 'play_pattern',
  extensions: [fieldPatternsValidatorExtension],
  mutator: nextConnectionMutator,
  generator: {
    javascript(block, _javascriptGenerator, environment: MusicLabEnvironment) {
      if (!environment.generating) {
        // Ignore generating unless it is within a top block
        return '';
      }

      return `Sequencer.playPattern(${JSON.stringify(
        block.getFieldValue(FIELD_PATTERN_NAME),
      )}, "${block.id}");`;
    },
  },
});

const playPatternAiAtCurrentLocationSimple2 = defineBlock({
  type: BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2,
  message0: '%1 play AI drums %2',
  args0: [
    {
      type: 'field_image',
      src: imgAiBot,
      width: 24,
      height: 24,
      alt: '',
    },
    fieldPatternAiDefinition,
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'lab_blocks',
  tooltip: 'play AI drums',
  helpUrl: DOCS_BASE_URL + 'play_pattern_ai',
  extensions: [fieldPatternsValidatorExtension],
  mutator: nextConnectionMutator,
  generator: {
    javascript(block, _javascriptGenerator, environment: MusicLabEnvironment) {
      if (!environment.generating) {
        // Ignore generating unless it is within a top block
        return '';
      }

      return `Sequencer.playPattern(${JSON.stringify(
        block.getFieldValue(FIELD_PATTERN_AI_NAME),
      )}, "${block.id}");`;
    },
  },
});

const playChordAtCurrentLocationSimple2 = defineBlock({
  type: BlockTypes.PLAY_CHORD_AT_CURRENT_LOCATION_SIMPLE2,
  message0: 'play notes %1',
  args0: [fieldChordDefinition],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'lab_blocks',
  tooltip: 'play notes',
  helpUrl: DOCS_BASE_URL + 'play_keys',
  mutator: nextConnectionMutator,
  generator: {
    javascript(block, _javascriptGenerator, environment: MusicLabEnvironment) {
      if (!environment.generating) {
        // Ignore generating unless it is within a top block
        return '';
      }

      return `Sequencer.playChord(${JSON.stringify(
        block.getFieldValue(FIELD_CHORD_NAME),
      )},  "${block.id}");`;
    },
  },
});

const playTuneAtCurrentLocationSimple2 = defineBlock({
  type: BlockTypes.PLAY_TUNE_AT_CURRENT_LOCATION_SIMPLE2,
  message0: 'play tune %1',
  args0: [fieldTuneDefinition],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'lab_blocks',
  tooltip: 'play tune',
  helpUrl: DOCS_BASE_URL + 'play_tune',
  mutator: nextConnectionMutator,
  generator: {
    javascript(block, _javascriptGenerator, environment: MusicLabEnvironment) {
      if (!environment.generating) {
        // Ignore generating unless it is within a top block
        return '';
      }

      return `Sequencer.playTune(${JSON.stringify(
        block.getFieldValue(FIELD_TUNE_NAME),
      )},  "${block.id}");`;
    },
  },
});

const playRestAtCurrentLocationSimple2 = defineBlock({
  type: BlockTypes.PLAY_REST_AT_CURRENT_LOCATION_SIMPLE2,
  message0: 'rest for %1',
  args0: [fieldRestDurationDefinition],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'lab_blocks',
  tooltip: 'rest',
  helpUrl: DOCS_BASE_URL + 'rest',
  mutator: nextConnectionMutator,
  generator: {
    javascript(block, _javascriptGenerator, environment: MusicLabEnvironment) {
      if (!environment.generating) {
        // Ignore generating unless it is within a top block
        return '';
      }

      return `Sequencer.rest(${block.getFieldValue(FIELD_REST_DURATION_NAME)});`;
    },
  },
});

const setEffectAtCurrentLocationSimple2 = defineBlock({
  type: BlockTypes.SET_EFFECT_AT_CURRENT_LOCATION_SIMPLE2,
  message0: 'set %1 to %2',
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
  previousStatement: true,
  nextStatement: true,
  style: 'lab_blocks',
  tooltip: 'set effect',
  helpUrl: DOCS_BASE_URL + 'set_effect',
  extensions: [fieldEffectsExtension],
  generator: {
    javascript(block, _javascriptGenerator, environment: MusicLabEnvironment) {
      if (!environment.generating) {
        // Ignore generating unless it is within a top block
        return '';
      }

      const effectName = block.getFieldValue(FIELD_EFFECTS_NAME);
      const effectValue = block.getFieldValue(FIELD_EFFECTS_VALUE);
      return `Sequencer.setEffect('${effectName}', '${effectValue}');`;
    },
  },
});

const playSoundsTogether = defineBlock({
  type: BlockTypes.PLAY_SOUNDS_TOGETHER,
  message0: 'play together',
  message1: '%1',
  args1: [
    {
      type: 'input_statement',
      name: 'code',
    },
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'logic_blocks',
  tooltip: 'play sounds together',
  helpUrl: DOCS_BASE_URL + 'play_together',
  mutator: nextConnectionMutator,
  generator: {
    javascript(block, javascriptGenerator, environment: MusicLabEnvironment) {
      if (!environment.generating) {
        // Ignore generating unless it is within a top block
        return '';
      }

      return ` Sequencer.playTogether();
        ${javascriptGenerator.statementToCode(block, 'code')}
        Sequencer.endTogether();
      `;
    },
  },
});

const playSoundsTogetherNoNext = defineBlock({
  type: BlockTypes.PLAY_SOUNDS_TOGETHER_NO_NEXT,
  message0: 'play together',
  message1: '%1',
  args1: [
    {
      type: 'input_statement',
      name: 'code',
    },
  ],
  inputsInline: true,
  previousStatement: true,
  style: 'logic_blocks',
  tooltip: 'play sounds together',
  helpUrl: DOCS_BASE_URL + 'play_together',
  mutator: nextConnectionMutator,
  generator: {
    javascript(block, javascriptGenerator, environment: MusicLabEnvironment) {
      if (!environment.generating) {
        // Ignore generating unless it is within a top block
        return '';
      }

      return ` Sequencer.playTogether();
        ${javascriptGenerator.statementToCode(block, 'code')}
        Sequencer.endTogether();
      `;
    },
  },
});

const playSoundsSequential = defineBlock({
  type: BlockTypes.PLAY_SOUNDS_SEQUENTIAL,
  message0: 'play sequential',
  args0: [],
  message1: '%1',
  args1: [
    {
      type: 'input_statement',
      name: 'code',
    },
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'logic_blocks',
  tooltip: 'play sounds sequentially',
  helpUrl: DOCS_BASE_URL + 'play_sequential',
  mutator: nextConnectionMutator,
  generator: {
    javascript(block, javascriptGenerator, environment: MusicLabEnvironment) {
      if (!environment.generating) {
        // Ignore generating unless it is within a top block
        return '';
      }

      return ` Sequencer.playSequential();
        ${javascriptGenerator.statementToCode(block, 'code')}
        Sequencer.endSequential();
        `;
    },
  },
});

const playSoundsRandom = defineBlock({
  type: BlockTypes.PLAY_SOUNDS_RANDOM,
  message0: 'play random',
  message1: '%1',
  args1: [
    {
      type: 'input_statement',
      name: 'code',
    },
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'logic_blocks',
  tooltip: 'play sounds randomly',
  helpUrl: DOCS_BASE_URL + 'play_random',
  mutator: nextConnectionMutator,
  generator: {
    javascript(block, javascriptGenerator, environment: MusicLabEnvironment) {
      if (!environment.generating) {
        // Ignore generating unless it is within a top block
        return '';
      }

      const resultArray = [];
      let currentBlock = block.getInputTargetBlock('code');
      while (currentBlock) {
        const codeForBlock = getCodeForSingleBlock(
          currentBlock,
          javascriptGenerator,
        );
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
  },
});

const repeatSimple2 = defineBlock({
  type: BlockTypes.REPEAT_SIMPLE2,
  message0: En.CONTROLS_REPEAT_TITLE,
  args0: [
    {
      type: 'field_number',
      name: 'times',
      value: 1,
      min: 0,
      max: 100,
    },
  ],
  message1: `${En.CONTROLS_REPEAT_INPUT_DO} %1`,
  args1: [
    {
      type: 'input_statement',
      name: 'code',
    },
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'loop_blocks',
  tooltip: En.CONTROLS_REPEAT_TOOLTIP,
  helpUrl: DOCS_BASE_URL + 'repeat',
  mutator: nextConnectionMutator,
  generator: {
    javascript(block, javascriptGenerator, environment: MusicLabEnvironment) {
      if (!environment.generating) {
        // Ignore generating unless it is within a top block
        return '';
      }

      const repeats = block.getFieldValue('times');

      let branch = javascriptGenerator.statementToCode(block, 'code');
      branch = javascriptGenerator.addLoopTrap(branch, block);
      let code = '';
      const loopVar = javascriptGenerator.nameDB_?.getDistinctName(
        'count',
        Blockly.Names.NameType.VARIABLE,
      );
      let endVar = repeats;
      endVar = javascriptGenerator.nameDB_?.getDistinctName(
        'repeat_end',
        Blockly.Names.NameType.VARIABLE,
      );
      code += `
        var ${endVar} = ${repeats};
        for (var ${loopVar} = 0; ${loopVar} < ${endVar} && __loopIterationsCount < ${MAX_LOOP_ITERATIONS_COUNT}; ${loopVar}++, __loopIterationsCount++) {
          ${branch}
        }
      `;

      return `
        Sequencer.playSequential();
        ${code}
        Sequencer.endSequential();
        `;
    },
  },
});

const blocks = [
  whenRunSimple2,
  triggeredAtSimple2,
  playSoundAtCurrentLocationSimple2,
  playPatternAtCurrentLocationSimple2,
  playPatternAiAtCurrentLocationSimple2,
  playChordAtCurrentLocationSimple2,
  playTuneAtCurrentLocationSimple2,
  playRestAtCurrentLocationSimple2,
  setEffectAtCurrentLocationSimple2,
  playSoundsTogether,
  playSoundsTogetherNoNext,
  playSoundsSequential,
  playSoundsRandom,
  repeatSimple2,
];

export default blocks;
