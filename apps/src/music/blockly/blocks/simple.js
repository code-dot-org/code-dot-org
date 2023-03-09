import {BlockTypes} from '../blockTypes';
import {isBlockInsideWhenRun} from '../blockUtils';
import {FIELD_SOUNDS_NAME} from '../constants';
import {fieldSoundsDefinition} from '../fields';

export const playSoundAtCurrentLocation = {
  definition: {
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION,
    message0: 'play %1',
    args0: [fieldSoundsDefinition],
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
    style: 'lab_blocks',
    tooltip: 'go to next measure',
    helpUrl: ''
  },
  generator: ctx => 'currentMeasureLocation++\n'
};
