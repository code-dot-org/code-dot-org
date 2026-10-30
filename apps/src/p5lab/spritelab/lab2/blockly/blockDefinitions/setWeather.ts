import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {WEATHER_KINDS} from '../../weather';

export const SET_WEATHER_BLOCK_TYPE = 'spritelab2_setWeather';

export const SET_WEATHER_OPTIONS: [string, string][] = WEATHER_KINDS.map(
  kind => [kind, kind]
);

/** World-wide weather for the scene, until the next set or the scene ends.
    "none" clears it. */
const definition: BlockJson = {
  type: SET_WEATHER_BLOCK_TYPE,
  message0: 'set weather to %1',
  args0: [
    {
      type: 'field_dropdown',
      name: 'WEATHER',
      options: SET_WEATHER_OPTIONS,
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip: 'Rain or snow falls through the whole scene. None clears it.',
};

const generator: GeneratorFunction = block =>
  `setWeather(${JSON.stringify(block.getFieldValue('WEATHER'))});\n`;

export default {definition, generator};
