import musicI18n from '../../locale';
import {BlockTypes} from '../blockTypes';
import {isBlockInsideWhenRun} from '../blockUtils';
import {FIELD_SOUNDS_NAME} from '../constants';
import {fieldSoundsDefinition} from '../fields';

export const playSoundAtCurrentLocation = {
  definition: {
    type: BlockTypes.PLAY_SOUND_AT_CURRENT_LOCATION,
    message0: musicI18n.blockly_blockPlaySound({sound: '%1'}),
    args0: [fieldSoundsDefinition],
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    colour: 230,
    tooltip: musicI18n.blockly_blockPlaySoundTooltip(),
    helpUrl: '',
  },
  generator: ctx =>
    'Sequencer.playSoundAtMeasureById("' +
    ctx.getFieldValue(FIELD_SOUNDS_NAME) +
    '", ' +
    'currentMeasureLocation' +
    ', ' +
    (isBlockInsideWhenRun(ctx) ? 'true' : 'false') +
    ');\n',
};

export const setCurrentLocationNextMeasure = {
  definition: {
    type: BlockTypes.SET_CURRENT_LOCATION_NEXT_MEASURE,
    message0: musicI18n.blockly_blockSetLocationNextMeasure(),
    inputsInline: true,
    previousStatement: null,
    nextStatement: null,
    style: 'lab_blocks',
    tooltip: musicI18n.blockly_blockSetLocationNextMeasureTooltip(),
    helpUrl: '',
  },
  generator: ctx => 'currentMeasureLocation++\n',
};
