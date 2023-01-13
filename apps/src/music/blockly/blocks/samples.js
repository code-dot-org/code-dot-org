import {BlockTypes} from '../blockTypes';
import Globals from '../../globals';

// Examine chain of parents to see if one is 'when_run'.
const isBlockInsideWhenRun = ctx => {
  let block = ctx;
  while ((block = block.getParent())) {
    if (block.type === 'when_run') {
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
    message0: 'play %1 at measure %2',
    args0: [
      {
        type: 'field_sounds',
        name: 'sound',
        getLibrary: () => Globals.getLibrary(),
        playPreview: (id, onStop) => {
          Globals.getPlayer().previewSound(id, onStop);
        },
        currentValue: 'pop/cafe_beat'
      },
      {
        type: 'input_value',
        name: 'measure'
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
    ctx.getFieldValue('sound') +
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
        type: 'field_sounds',
        name: 'sound',
        getLibrary: () => Globals.getLibrary(),
        playPreview: (id, onStop) => {
          Globals.getPlayer().previewSound(id, onStop);
        },
        currentValue: 'pop/cafe_beat'
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
    ctx.getFieldValue('sound') +
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
    colour: 95,
    tooltip: 'play sound',
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
        name: 'trackName',
        text: 'my track'
      }
    ],
    inputsInline: true,
    nextStatement: null,
    colour: 150,
    tooltip: 'new track',
    helpUrl: '',
    extensions: ['default_track_name_extension']
  },
  generator: ctx => {
    return `MusicPlayer.createTrack("${ctx.id}", "${ctx.getFieldValue(
      'trackName'
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
        name: 'trackName',
        text: 'my track'
      },
      {
        type: 'input_value',
        name: 'measure'
      }
    ],
    inputsInline: true,
    nextStatement: null,
    colour: 150,
    tooltip: 'new track',
    helpUrl: '',
    extensions: ['default_track_name_extension']
  },
  generator: ctx => {
    return `MusicPlayer.createTrack("${ctx.id}", "${ctx.getFieldValue(
      'trackName'
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
        name: 'trackName',
        text: 'my track'
      },
      {
        type: 'input_dummy',
        name: 'trigger'
      }
    ],
    inputsInline: true,
    nextStatement: null,
    colour: 150,
    tooltip: 'new track',
    helpUrl: '',
    extensions: ['default_track_name_extension', 'dynamic_trigger_extension']
  },
  generator: ctx => {
    return `MusicPlayer.createTrack("${
      ctx.id
    }" + "--" + getTriggerCount(), "${ctx.getFieldValue(
      'trackName'
    )}", Math.ceil(MusicPlayer.getPlayheadPosition()), false);\n`;
  }
};

export const playSoundInTrack = {
  definition: {
    type: BlockTypes.PLAY_SOUND_IN_TRACK,
    message0: 'play %1',
    args0: [
      {
        type: 'field_sounds',
        name: 'sound',
        getLibrary: () => Globals.getLibrary(),
        playPreview: (id, onStop) => {
          Globals.getPlayer().previewSound(id, onStop);
        },
        currentValue: 'pop/cafe_beat'
      }
    ],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: 'play sound',
    helpUrl: ''
  },
  generator: ctx => {
    return `MusicPlayer.addSoundToTrack(${getCurrentTrackId(
      ctx
    )}, "${ctx.getFieldValue('sound')}");\n`;
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
    colour: 50
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
