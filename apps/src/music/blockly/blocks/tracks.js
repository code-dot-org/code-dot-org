import {BlockTypes} from '../blockTypes';
import {
  DEFAULT_TRACK_NAME_EXTENSION,
  DYNAMIC_TRIGGER_EXTENSION,
  EXTRA_SOUND_INPUT_PREFIX,
  FIELD_REST_DURATION_NAME,
  PLAY_MULTI_MUTATOR,
  PRIMARY_SOUND_INPUT_NAME,
  SOUND_VALUE_TYPE,
  TRACK_NAME_FIELD,
  TRIGGER_FIELD,
} from '../constants';
import {fieldRestDurationDefinition} from '../fields';

const getCurrentTrackId = ctx => {
  let block = ctx;
  while ((block = block.getParent())) {
    if (
      [BlockTypes.NEW_TRACK_AT_START, BlockTypes.NEW_TRACK_AT_MEASURE].includes(
        block.type
      )
    ) {
      return `"${block.id}"`;
    }

    if (block.type === BlockTypes.NEW_TRACK_ON_TRIGGER) {
      return `"${block.id}" + "--" + getTriggerCount()`;
    }
  }

  return null;
};

export const newTrackAtStart = {
  definition: {
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
    nextStatement: null,
    style: 'setup_blocks',
    tooltip: 'new track',
    helpUrl: '',
    extensions: [DEFAULT_TRACK_NAME_EXTENSION],
  },
  generator: ctx => {
    return `MusicPlayer.createTrack("${ctx.id}", "${ctx.getFieldValue(
      TRACK_NAME_FIELD
    )}", 1, true);\n`;
  },
};

export const newTrackAtMeasure = {
  definition: {
    type: BlockTypes.NEW_TRACK_AT_MEASURE,
    message0: 'new track %1 at measure %2',
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
    nextStatement: null,
    style: 'setup_blocks',
    tooltip: 'new track',
    helpUrl: '',
    extensions: [DEFAULT_TRACK_NAME_EXTENSION],
  },
  generator: ctx => {
    return `MusicPlayer.createTrack("${ctx.id}", "${ctx.getFieldValue(
      TRACK_NAME_FIELD
    )}", ${Blockly.JavaScript.valueToCode(
      ctx,
      'measure',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    )}, true);\n`;
  },
};

export const newTrackOnTrigger = {
  definition: {
    type: BlockTypes.NEW_TRACK_ON_TRIGGER,
    message0: 'new track %1 when %2 triggered',
    args0: [
      {
        type: 'field_input',
        name: TRACK_NAME_FIELD,
        text: 'my track',
      },
      {
        type: 'input_dummy',
        name: TRIGGER_FIELD,
      },
    ],
    inputsInline: true,
    nextStatement: null,
    style: 'event_blocks',
    tooltip: 'new track',
    helpUrl: '',
    extensions: [DEFAULT_TRACK_NAME_EXTENSION, DYNAMIC_TRIGGER_EXTENSION],
  },
  generator: ctx => {
    return `MusicPlayer.createTrack("${
      ctx.id
    }" + "--" + getTriggerCount(), "${ctx.getFieldValue(
      TRACK_NAME_FIELD
    )}", Math.ceil(startPosition), false);\n`;
  },
};

export const playSoundInTrack = {
  definition: {
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
    previousStatement: null,
    nextStatement: null,
    mutator: PLAY_MULTI_MUTATOR,
    style: 'lab_blocks',
    tooltip: 'play sound',
    helpUrl: '',
  },
  generator: ctx => {
    const allSounds = [
      `"${Blockly.JavaScript.valueToCode(
        ctx,
        PRIMARY_SOUND_INPUT_NAME,
        Blockly.JavaScript.ORDER_ATOMIC
      )}"`,
    ];
    for (let i = 0; i < ctx.extraSoundInputCount_; i++) {
      allSounds.push(
        `"${Blockly.JavaScript.valueToCode(
          ctx,
          EXTRA_SOUND_INPUT_PREFIX + i,
          Blockly.JavaScript.ORDER_ATOMIC
        )}"`
      );
    }
    return `MusicPlayer.addSoundsToTrack(${getCurrentTrackId(
      ctx
    )}, ${allSounds.join(',')});\n`;
  },
};

export const restInTrack = {
  definition: {
    type: BlockTypes.REST_IN_TRACK,
    message0: 'rest for %1',
    args0: [fieldRestDurationDefinition],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
  },
  generator: ctx =>
    `MusicPlayer.addRestToTrack(${getCurrentTrackId(ctx)}, ${ctx.getFieldValue(
      FIELD_REST_DURATION_NAME
    )});\n`,
};
