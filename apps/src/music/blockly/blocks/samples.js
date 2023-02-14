import {BlockTypes} from '../blockTypes';
import Globals from '../../globals';
import {
  DEFAULT_SOUND,
  DEFAULT_TRACK_NAME_EXTENSION,
  DYNAMIC_TRIGGER_EXTENSION,
  EXTRA_SAMPLE_FIELD_PREFIX,
  FIELD_SOUNDS_NAME,
  FIELD_SOUNDS_TYPE,
  PLAY_MULTI_MUTATOR,
  TRACK_NAME_FIELD,
  TRIGGER_FIELD
} from '../constants';

// Examine chain of parents to see if one is 'when_run'.
const isBlockInsideWhenRun = ctx => {
  let block = ctx;
  while ((block = block.getParent())) {
    if (
      [BlockTypes.WHEN_RUN, BlockTypes.WHEN_RUN_SIMPLE2].includes(block.type)
    ) {
      return true;
    }
  }

  return false;
};

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

export const playSound = {
  definition: {
    type: BlockTypes.PLAY_SOUND,
    style: 'music_blocks',
    message0: 'play %1 at measure %2',
    args0: [
      {
        type: FIELD_SOUNDS_TYPE,
        name: FIELD_SOUNDS_NAME,
        getLibrary: () => Globals.getLibrary(),
        playPreview: (id, onStop) => {
          Globals.getPlayer().previewSound(id, onStop);
        },
        currentValue: DEFAULT_SOUND
      },
      {
        type: 'input_value',
        name: 'measure'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    tooltip: 'play sound',
    helpUrl: ''
  },
  generator: ctx =>
    'MusicPlayer.playSoundAtMeasureById("' +
    ctx.getFieldValue(FIELD_SOUNDS_NAME) +
    '", ' +
    Blockly.JavaScript.valueToCode(
      ctx,
      'measure',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    ) +
    ', ' +
    (isBlockInsideWhenRun(ctx) ? 'true' : 'false') +
    ');\n'
};

export const playSoundAtCurrentLocation = {
  definition: {
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION,
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
    colour: 230,
    tooltip: 'play sound',
    helpUrl: ''
  },
  generator: ctx =>
    'MusicPlayer.playSoundAtMeasureById("' +
    ctx.getFieldValue(FIELD_SOUNDS_NAME) +
    '", ' +
    'currentMeasureLocation' +
    ', ' +
    (isBlockInsideWhenRun(ctx) ? 'true' : 'false') +
    ');\n'
};

export const setCurrentLocationNextMeasure = {
  definition: {
    type: BlockTypes.SET_CURRENT_LOCATION_NEXT_MEASURE,
    message0: 'go to next measure',
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'music_blocks',
    tooltip: 'go to next measure',
    helpUrl: ''
  },
  generator: ctx => 'currentMeasureLocation++\n'
};

export const newTrackAtStart = {
  definition: {
    type: BlockTypes.NEW_TRACK_AT_START,
    message0: 'new track %1',
    args0: [
      {
        type: 'field_input',
        name: TRACK_NAME_FIELD,
        text: 'my track'
      }
    ],
    inputsInline: true,
    nextStatement: null,
    style: 'setup_blocks',
    tooltip: 'new track',
    helpUrl: '',
    extensions: [DEFAULT_TRACK_NAME_EXTENSION]
  },
  generator: ctx => {
    return `MusicPlayer.createTrack("${ctx.id}", "${ctx.getFieldValue(
      TRACK_NAME_FIELD
    )}", 1, true);\n`;
  }
};

export const newTrackAtMeasure = {
  definition: {
    type: BlockTypes.NEW_TRACK_AT_MEASURE,
    message0: 'new track %1 at measure %2',
    args0: [
      {
        type: 'field_input',
        name: TRACK_NAME_FIELD,
        text: 'my track'
      },
      {
        type: 'input_value',
        name: 'measure'
      }
    ],
    inputsInline: true,
    nextStatement: null,
    style: 'setup_blocks',
    tooltip: 'new track',
    helpUrl: '',
    extensions: [DEFAULT_TRACK_NAME_EXTENSION]
  },
  generator: ctx => {
    return `MusicPlayer.createTrack("${ctx.id}", "${ctx.getFieldValue(
      TRACK_NAME_FIELD
    )}", ${Blockly.JavaScript.valueToCode(
      ctx,
      'measure',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    )}, true);\n`;
  }
};

export const newTrackOnTrigger = {
  definition: {
    type: BlockTypes.NEW_TRACK_ON_TRIGGER,
    message0: 'new track %1 when %2 triggered',
    args0: [
      {
        type: 'field_input',
        name: TRACK_NAME_FIELD,
        text: 'my track'
      },
      {
        type: 'input_dummy',
        name: TRIGGER_FIELD
      }
    ],
    inputsInline: true,
    nextStatement: null,
    style: 'event_blocks',
    tooltip: 'new track',
    helpUrl: '',
    extensions: [DEFAULT_TRACK_NAME_EXTENSION, DYNAMIC_TRIGGER_EXTENSION]
  },
  generator: ctx => {
    return `MusicPlayer.createTrack("${
      ctx.id
    }" + "--" + getTriggerCount(), "${ctx.getFieldValue(
      TRACK_NAME_FIELD
    )}", Math.ceil(MusicPlayer.getCurrentPlayheadPosition()), false);\n`;
  }
};

export const playSoundInTrack = {
  definition: {
    type: BlockTypes.PLAY_SOUND_IN_TRACK,
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
    mutator: PLAY_MULTI_MUTATOR,
    style: 'music_blocks',
    tooltip: 'play sound',
    helpUrl: ''
  },
  generator: ctx => {
    const allSounds = [`"${ctx.getFieldValue(FIELD_SOUNDS_NAME)}"`];
    for (let i = 0; i < ctx.extraSampleCount_; i++) {
      allSounds.push(`"${ctx.getFieldValue(EXTRA_SAMPLE_FIELD_PREFIX + i)}"`);
    }
    return `MusicPlayer.addSoundsToTrack(${getCurrentTrackId(
      ctx
    )}, ${allSounds.join(',')});\n`;
  }
};

export const restInTrack = {
  definition: {
    type: BlockTypes.REST_IN_TRACK,
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
    style: 'music_blocks'
  },
  generator: ctx =>
    `MusicPlayer.addRestToTrack(${getCurrentTrackId(
      ctx
    )}, ${Blockly.JavaScript.valueToCode(
      ctx,
      'measures',
      Blockly.JavaScript.ORDER_ASSIGNMENT
    )});\n`
};
