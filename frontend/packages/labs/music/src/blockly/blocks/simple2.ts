import * as Blockly from 'blockly/core';
import {JavascriptGenerator} from 'blockly/javascript';
import type {BlockDefinition} from '@code-dot-org/blockly-workspace';

import {BlockTypes} from '../blockTypes';
import {
  TriggerStart,
  DOCS_BASE_URL,
  FIELD_PATTERN_NAME,
  FIELD_PATTERN_AI_NAME,
  FIELD_PATTERNS_VALIDATOR,
  FIELD_TRIGGER_START_NAME,
  FIELD_SOUNDS_VALIDATOR,
  FIELD_SOUNDS_NAME,
  NEXT_CONNECTION_MUTATOR,
  TRIGGER_FIELD,
} from '../constants';
import {
  fieldPatternDefinition,
  fieldPatternAiDefinition,
  fieldSoundsDefinition,
  fieldTriggerDefinition,
} from '../fields';

const blocks: BlockDefinition[] = [
  {
    type: BlockTypes.WHEN_RUN_SIMPLE2,
    message0: 'when run',
    inputsInline: true,
    nextStatement: true,
    style: 'setup_blocks',
    tooltip: 'when run',
    helpUrl: '',
    generator: {
      javascript(
        block: Blockly.Block,
        javascriptGenerator: JavascriptGenerator,
      ) {
        const nextBlock =
          block.nextConnection && block.nextConnection.targetBlock();
        const handlerCode = javascriptGenerator.blockToCode(nextBlock, false);
        return `
      if (__context == 'when_run') {
        Sequencer.newSequence();
        Sequencer.startFunctionContext('when_run');
        Sequencer.playSequential();
        ${handlerCode}
      }`;
      },
    },
  },
  {
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
      javascript(
        block: Blockly.Block,
        javascriptGenerator: JavascriptGenerator,
      ) {
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
  },
  {
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION_SIMPLE2,
    message0: 'play %1',
    args0: [fieldSoundsDefinition],
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    style: 'lab_blocks',
    tooltip: 'play sound',
    helpUrl: DOCS_BASE_URL + 'play_sample',
    extensions: [FIELD_SOUNDS_VALIDATOR],
    mutator: NEXT_CONNECTION_MUTATOR,
    generator: {
      javascript(block: Blockly.Block) {
        return `Sequencer.playSound("${block.getFieldValue(FIELD_SOUNDS_NAME)}", "${
          block.id
        }");\n`;
      },
    },
  },
  {
    type: BlockTypes.PLAY_PATTERN_AT_CURRENT_LOCATION_SIMPLE2,
    message0: 'play drums %1',
    args0: [fieldPatternDefinition],
    inputsInline: true,
    previousStatement: true,
    nextStatement: true,
    style: 'lab_blocks',
    tooltip: 'play drums',
    helpUrl: DOCS_BASE_URL + 'play_pattern',
    extensions: [FIELD_PATTERNS_VALIDATOR],
    mutator: NEXT_CONNECTION_MUTATOR,
    generator: {
      javascript(block: Blockly.Block) {
        return `Sequencer.playPattern(${JSON.stringify(
          block.getFieldValue(FIELD_PATTERN_NAME),
        )}, "${block.id}");`;
      },
    },
  },
  {
    type: BlockTypes.PLAY_PATTERN_AI_AT_CURRENT_LOCATION_SIMPLE2,
    message0: '%1 play AI drums %2',
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
    previousStatement: true,
    nextStatement: true,
    style: 'lab_blocks',
    tooltip: 'play AI drums',
    helpUrl: DOCS_BASE_URL + 'play_pattern_ai',
    extensions: [FIELD_PATTERNS_VALIDATOR],
    mutator: NEXT_CONNECTION_MUTATOR,
    generator: {
      javascript(block: Blockly.Block) {
        return `Sequencer.playPattern(${JSON.stringify(
          block.getFieldValue(FIELD_PATTERN_AI_NAME),
        )}, "${block.id}");`;
      },
    },
  },
];

export default blocks;
