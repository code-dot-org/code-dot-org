import * as api from './api';
import _ from 'lodash';
import color from '../../../util/color';
import {getFirstParam} from '../../../dropletUtils';
import {
  N_COLOR_LEDS,
  SENSOR_VARS,
  BUTTON_VARS,
  COMPONENT_EVENTS,
  SONG_CHARGE
} from './PlaygroundConstants';

export const MAKER_CATEGORY = 'Maker';
const CIRCUIT_CATEGORY = 'Circuit';

const pixelType = '[ColorLed].';
const colorPixelVariables = _.range(N_COLOR_LEDS).map(index => `colorLeds[${index}]`);
const colorLedBlockPrefix = `${colorPixelVariables[0]}.`;

export function stringifySong(song) {
  return '[\n' +
      song.map(note => `  ${JSON.stringify(note)}`).join(',\n') +
      '\n]';
}

/**
 * Relies on `this` being the Droplet socket when in droplet mode, and, in
 * text mode, this.parent being undefined.
 * @param {AceEditor} editor
 * @returns {Array.<string>}
 */
const boardEventDropdownGenerator = function (editor) {
  return getBoardEventDropdownForParam(
    getFirstParam('onBoardEvent', this.parent, editor));
};

/**
 * Generate an array of dropdown strings appropriate for the second
 * parameter to onBoardEvent, given a particular first parameter to
 * onBoardEvent.
 * @param {string} firstParam - first parameter to onBoardEvent
 */
export function getBoardEventDropdownForParam(firstParam) {
  const wrapInQuotes = e => `"${e}"`;
  const idealOptions = COMPONENT_EVENTS[firstParam];
  if (Array.isArray(idealOptions)) {
    return _.chain(idealOptions)
      .sort()
      .sortedUniq()
      .map(wrapInQuotes)
      .value();
  }

  // If we can't find an ideal subset, use all possible
  return _.chain(COMPONENT_EVENTS)
    .values()
    .flatten()
    .sort()
    .sortedUniq()
    .map(wrapInQuotes)
    .value();
}

export const blocks = [
  /**
   * Generic Johnny-Five / Firmata blocks
   */
  {func: 'pinMode', parent: api, category: MAKER_CATEGORY, paletteParams: ['pin', 'mode'], params: ['13', '"output"'], dropdown: { 1: ['"output"', '"input"', '"analog"'] }},
  {func: 'digitalWrite', parent: api, category: MAKER_CATEGORY, paletteParams: ['pin', 'value'], params: ['13', '1'], dropdown: { 1: ['1', '0'] }},
  {func: 'digitalRead', parent: api, category: MAKER_CATEGORY, type: 'value', nativeIsAsync: true, paletteParams: ['pin'], params: ['"D4"']},
  {func: 'analogWrite', parent: api, category: MAKER_CATEGORY, paletteParams: ['pin', 'value'], params: ['5', '150']},
  {func: 'analogRead', parent: api, category: MAKER_CATEGORY, type: 'value', nativeIsAsync: true, paletteParams: ['pin'], params: ['5']},
  {func: 'timedLoop', parent: api, category: MAKER_CATEGORY, paletteParams: ['ms', 'callback'], params: ['1000', 'function(exit) {\n  // Call exit() to stop looping\n  exit();\n}']},
  {func: 'exit', category: MAKER_CATEGORY, noAutocomplete: true},

  /**
   * Circuit-Playground-specific blocks
   */
  {func: 'onBoardEvent', parent: api, category: CIRCUIT_CATEGORY, paletteParams: ['component', 'event', 'callback'], params: ['buttonL', '"press"', "function(event) {\n  \n}"], dropdown: { 0: Object.keys(COMPONENT_EVENTS), 1: boardEventDropdownGenerator }},

  {func: 'led', category: CIRCUIT_CATEGORY, type: 'readonlyproperty', noAutocomplete: true},
  {func: 'led.on', category: CIRCUIT_CATEGORY},
  {func: 'led.off', category: CIRCUIT_CATEGORY},

  {func: 'on', blockPrefix: colorLedBlockPrefix, category: CIRCUIT_CATEGORY, tipPrefix: pixelType, modeOptionName: '*.on', objectDropdown: {options: colorPixelVariables}},
  {func: 'off', blockPrefix: colorLedBlockPrefix, category: CIRCUIT_CATEGORY, tipPrefix: pixelType, modeOptionName: '*.off', objectDropdown: {options: colorPixelVariables}},

  {func: 'toggle', blockPrefix: colorLedBlockPrefix, category: CIRCUIT_CATEGORY, tipPrefix: pixelType, modeOptionName: "*.toggle", objectDropdown: { options: colorPixelVariables }  },
  {func: 'blink', blockPrefix: colorLedBlockPrefix, category: CIRCUIT_CATEGORY, paletteParams: ['interval'], params: ['100'], tipPrefix: pixelType, modeOptionName: "*.blink", objectDropdown: { options: colorPixelVariables }  },
  {func: 'stop', blockPrefix: colorLedBlockPrefix, category: CIRCUIT_CATEGORY, tipPrefix: pixelType, modeOptionName: "*.stop", objectDropdown: { options: colorPixelVariables }  },
  {func: 'intensity', blockPrefix: colorLedBlockPrefix, category: CIRCUIT_CATEGORY, params: ['25'], tipPrefix: pixelType, modeOptionName: "*.intensity", objectDropdown: { options: colorPixelVariables }  },
  {func: 'color', blockPrefix: colorLedBlockPrefix, category: CIRCUIT_CATEGORY, paletteParams: ['color'], params: ['"#FF00FF"'], paramButtons: { minArgs: 1, maxArgs: 3}, tipPrefix: pixelType, modeOptionName: "*.color", objectDropdown: { options: colorPixelVariables }  },

  {func: 'buzzer', category: CIRCUIT_CATEGORY, type: 'readonlyproperty', noAutocomplete: true},
  {func: 'buzzer.frequency', category: CIRCUIT_CATEGORY, paletteParams: ['frequency', 'duration'], params: ['500', '100'], paramButtons: { minArgs: 1, maxArgs: 2}},
  {func: 'buzzer.note', category: CIRCUIT_CATEGORY, paletteParams: ['note', 'duration'], params: ['"A4"', '100'], paramButtons: { minArgs: 1, maxArgs: 2}},
  {func: 'buzzer.off', category: CIRCUIT_CATEGORY},
  {func: 'buzzer.stop', category: CIRCUIT_CATEGORY},
  {func: 'buzzer.play', category: CIRCUIT_CATEGORY, paletteParams: ['notes', 'tempo'], params: [stringifySong(SONG_CHARGE), 120], paramButtons: { minArgs: 1, maxArgs: 2}},

  // TODO(bjordan): re-add when dropdowns work with object refs
  //{func: 'accelerometer', category: CIRCUIT_CATEGORY, type: 'readonlyproperty', noAutocomplete: true},
  {func: 'accelerometer.getOrientation', category: CIRCUIT_CATEGORY, type: 'value', paletteParams: ['orientationType'], params: ['"inclination"'], dropdown: {0: ['"inclination"', '"pitch"', '"roll"']}},
  {func: 'accelerometer.getAcceleration', category: CIRCUIT_CATEGORY, type: 'value', paletteParams: ['orientationType'], params: ['"x"'], dropdown: {0: ['"x"', '"y"', '"z"', '"total"']}},
  {func: 'accelerometer.start', category: CIRCUIT_CATEGORY},
  {func: 'accelerometer.sensitivity', category: CIRCUIT_CATEGORY, type: 'property' },

  // TODO(bjordan): re-add when dropdowns work with object refs
  //{func: 'buttonL', category: CIRCUIT_CATEGORY, type: 'readonlyproperty', noAutocomplete: true},
  //{func: 'buttonR', category: CIRCUIT_CATEGORY, type: 'readonlyproperty', noAutocomplete: true},
  {func: 'isPressed', objectDropdown: {options: BUTTON_VARS, dropdownOnly: true}, category: CIRCUIT_CATEGORY, blockPrefix: `${BUTTON_VARS[0]}.`, modeOptionName: "*.isPressed", type: 'readonlyproperty', tipPrefix: '[Button].'},
  {func: 'holdtime', objectDropdown: {options: BUTTON_VARS, dropdownOnly: true}, category: CIRCUIT_CATEGORY, blockPrefix: `${BUTTON_VARS[0]}.`, modeOptionName: "*.holdtime", type: 'readonlyproperty', tipPrefix: '[Button].'},

  {func: 'value', objectDropdown: { options: SENSOR_VARS }, modeOptionName: "*.value", blockPrefix: `${SENSOR_VARS[0]}.`, category: CIRCUIT_CATEGORY, type: 'readonlyproperty', tipPrefix: '[Sensor].'},
  {func: 'getAveragedValue', objectDropdown: { options: SENSOR_VARS }, modeOptionName: "*.getAveragedValue", blockPrefix: `${SENSOR_VARS[0]}.`, category: CIRCUIT_CATEGORY, tipPrefix: '[Sensor].', params: ['500'], paletteParams: ['ms'], type: 'value'},
  {func: 'start', objectDropdown: { options: SENSOR_VARS }, modeOptionName: "*.start", blockPrefix: `${SENSOR_VARS[0]}.`, category: CIRCUIT_CATEGORY, tipPrefix: '[Sensor].'},
  {func: 'setScale', objectDropdown: { options: SENSOR_VARS }, modeOptionName: "*.setScale", blockPrefix: `${SENSOR_VARS[0]}.`, category: CIRCUIT_CATEGORY, tipPrefix: '[Sensor].', params: ['0', '100'], paletteParams: ['low', 'high']},
  {func: 'threshold', objectDropdown: { options: SENSOR_VARS }, modeOptionName: "*.threshold", blockPrefix: `${SENSOR_VARS[0]}.`, category: CIRCUIT_CATEGORY, type: 'property', tipPrefix: '[Sensor].' },

  // TODO(bjordan): re-add when dropdowns work with object refs
  //{func: 'toggleSwitch', category: CIRCUIT_CATEGORY, type: 'readonlyproperty', noAutocomplete: true},
  {func: 'toggleSwitch.isOpen', category: CIRCUIT_CATEGORY, type: 'readonlyproperty' },
];

export const categories = {
  [MAKER_CATEGORY]: {
    color: 'cyan',
    rgb: color.droplet_cyan,
    blocks: []
  },
  [CIRCUIT_CATEGORY]: {
    color: 'red',
    rgb: color.droplet_red,
    blocks: []
  },
};
