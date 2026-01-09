import {Order} from 'blockly/javascript';

import type {BlockSvg} from '@code-dot-org/blockly-workspace';
import {defineBlock} from '@code-dot-org/blockly-workspace';

import {BlockTypes} from '../blockTypes';
import {
  DEFAULT_TRACK_NAME_EXTENSION,
  EXTRA_SOUND_INPUT_PREFIX,
  FIELD_REST_DURATION_NAME,
  PRIMARY_SOUND_INPUT_NAME,
  SOUND_VALUE_TYPE,
  TRACK_NAME_FIELD,
} from '../constants';
import {playMultiMutator} from '../extensions/playMultiMutator';
import {fieldRestDurationDefinition, fieldTriggerDefinition} from '../fields';

const getCurrentTrackId = (ctx: BlockSvg) => {
  let block: BlockSvg | null = ctx;
  while ((block = block.getParent())) {
    if (
      (
        [
          BlockTypes.NEW_TRACK_AT_START,
          BlockTypes.NEW_TRACK_AT_MEASURE,
        ] as string[]
      ).includes(block.type)
    ) {
      return `"${block.id}"`;
    }

    if (block.type === BlockTypes.NEW_TRACK_ON_TRIGGER) {
      return `"${block.id}" + "--" + getTriggerCount()`;
    }
  }

  return null;
};

const playSoundInTrack = defineBlock({
  type: BlockTypes.PLAY_SOUND_IN_TRACK,
  message0: 'play %1',
  args0: [
    {
      type: 'input_value',
      name: PRIMARY_SOUND_INPUT_NAME,
      check: SOUND_VALUE_TYPE,
    },
  ],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  mutator: playMultiMutator,
  style: 'lab_blocks',
  tooltip: 'play sound',
  helpUrl: '',
  generator: {
    javascript(block, javascriptGenerator) {
      const allSounds = [
        `"${javascriptGenerator.valueToCode(
          block,
          PRIMARY_SOUND_INPUT_NAME,
          Order.ATOMIC,
        )}"`,
      ];
      for (let i = 0; i < block.extraSoundInputCount_; i++) {
        allSounds.push(
          `"${javascriptGenerator.valueToCode(
            block,
            EXTRA_SOUND_INPUT_PREFIX + i,
            Order.ATOMIC,
          )}"`,
        );
      }
      return `Sequencer.addSoundsToTrack(${getCurrentTrackId(
        block,
      )}, ${allSounds.join(',')});\n`;
    },
  },
});

const newTrackAtStart = defineBlock({
  type: BlockTypes.NEW_TRACK_AT_START,
  message0: 'new track %1',
  args0: [
    {
      type: 'field_input',
      name: TRACK_NAME_FIELD,
      text: 'my track',
    },
  ],
  inputsInline: true,
  nextStatement: true,
  style: 'setup_blocks',
  tooltip: 'new track',
  helpUrl: '',
  extensions: [DEFAULT_TRACK_NAME_EXTENSION],
  generator: {
    javascript(block) {
      return `Sequencer.createTrack("${block.id}", "${block.getFieldValue(
        TRACK_NAME_FIELD,
      )}", 1, true);\n`;
    },
  },
});

const newTrackAtMeasure = defineBlock({
  type: BlockTypes.NEW_TRACK_AT_MEASURE,
  message0: 'new track %1 at %2',
  args0: [
    {
      type: 'field_input',
      name: TRACK_NAME_FIELD,
      text: 'my track',
    },
    {
      type: 'input_value',
      name: 'measure',
    },
  ],
  inputsInline: true,
  nextStatement: true,
  style: 'setup_blocks',
  tooltip: 'new track at measure',
  helpUrl: '',
  extensions: [DEFAULT_TRACK_NAME_EXTENSION],
  generator: {
    javascript(block, javascriptGenerator) {
      return `Sequencer.createTrack("${block.id}", "${block.getFieldValue(
        TRACK_NAME_FIELD,
      )}", ${javascriptGenerator.valueToCode(
        block,
        'measure',
        Order.ASSIGNMENT,
      )}, true);\n`;
    },
  },
});

const newTrackOnTrigger = defineBlock({
  type: BlockTypes.NEW_TRACK_ON_TRIGGER,
  message0: 'new track %1 when %2 triggered',
  args0: [
    {
      type: 'field_input',
      name: TRACK_NAME_FIELD,
      text: 'my track',
    },
    fieldTriggerDefinition,
  ],
  inputsInline: true,
  nextStatement: true,
  style: 'event_blocks',
  tooltip: 'new track on trigger',
  helpUrl: '',
  extensions: [DEFAULT_TRACK_NAME_EXTENSION],
  generator: {
    javascript(block) {
      return `Sequencer.createTrack("${
        block.id
      }" + "--" + getTriggerCount(), "${block.getFieldValue(
        TRACK_NAME_FIELD,
      )}", Math.ceil(startPosition), false);\n`;
    },
  },
});

const restInTrack = defineBlock({
  type: BlockTypes.REST_IN_TRACK,
  message0: 'rest for %1',
  args0: [fieldRestDurationDefinition],
  inputsInline: true,
  previousStatement: true,
  nextStatement: true,
  style: 'lab_blocks',
  tooltip: 'rest',
  helpUrl: '',
  generator: {
    javascript(block) {
      return `Sequencer.addRestToTrack(${getCurrentTrackId(block)}, ${block.getFieldValue(
        FIELD_REST_DURATION_NAME,
      )});\n`;
    },
  },
});

const blocks = [
  newTrackAtStart,
  newTrackAtMeasure,
  newTrackOnTrigger,
  playSoundInTrack,
  restInTrack,
];

export default blocks;
