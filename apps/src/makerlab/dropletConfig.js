/* global dashboard */

import api from './api';
import _ from 'lodash';
import {getFirstParam} from '../dropletUtils';
import {N_COLOR_LEDS, TOUCH_PINS} from './PlaygroundConstants';

const COLOR_LIGHT_GREEN = '#D3E965';
const COLOR_CYAN = '#4DD0E1';

const playSongConfig = {
  song: [
    ["A", 500], [null, 50], ["A", 500], [null, 50], ["A", 500], [null, 50],
    ["F", 350], [null, 50], ["C5", 150], [null, 50], ["A", 500], [null, 50],
    ["F", 350], [null, 50], ["C5", 150], [null, 50], ["A", 650], [null, 50],
    [null, 500], ["E5", 500], [null, 50], ["E5", 500], [null, 50], ["E5", 500],
    [null, 50], ["F5", 350], [null, 50], ["C5", 150], [null, 50], ["G4", 500],
    [null, 50], ["F", 350], [null, 50], ["C5", 150], [null, 50], ["A", 650],
    [null, 50], [null, 500],
  ],
  tempo: 100000
};

const MAKERLAB_CATEGORY = 'Maker Lab';
const CIRCUIT_CATEGORY = 'Circuit';

const pixelType = '[ColorLed].';
const touchSensorType = '[TouchSensor].';
const colorPixelVariables = _.range(N_COLOR_LEDS).map(index => `colorLeds[${index}]`);
const touchSensorVariables = _.map(TOUCH_PINS, pin => `touchSensor${pin}`);
const colorLedBlockPrefix = `${colorPixelVariables[0]}.`;
const sensorVariables = ['soundSensor', 'lightSensor', 'tempSensor'];
const buttonVariables = ['buttonL', 'buttonR'];

const buttonEvents = ['press', 'down', 'up'];
const sensorEvents = ['change', 'data'];
const touchEvents = ['touch'];

const eventDropdowns = {
  buttonL: buttonEvents,
  buttonR: buttonEvents,
  toggleSwitch: ['open', 'close'],
  accelerometer: ['change', 'data']
};

sensorVariables.forEach(s => eventDropdowns[s] = sensorEvents);
touchSensorVariables.forEach(s => eventDropdowns[s] = touchEvents);

/**
 * Relies on `this` being the Droplet socket when in droplet mode, and, in
 * text mode, this.parent being undefined.
 * @param editor
 * @returns {Array.<string>}
 */
const boardEventDropdownGenerator = function (editor) {
  const firstParam = getFirstParam('onBoardEvent', this.parent, editor);
  const wrapInQuotes = e => `"${e}"`;
  return eventDropdowns[firstParam].map(wrapInQuotes);
};

module.exports.blocks = [
  /**
   * Generic Johnny-Five / Firmata blocks
   */
  {func: 'pinMode', parent: api, category: MAKERLAB_CATEGORY, paletteParams: ['pin', 'mode'], params: ['13', '"output"'], dropdown: { 1: ['"output"', '"input"', '"analog"'] }},
  {func: 'digitalWrite', parent: api, category: MAKERLAB_CATEGORY, paletteParams: ['pin', 'value'], params: ['13', '1'], dropdown: { 1: ['1', '0'] }},
  {func: 'digitalRead', parent: api, category: MAKERLAB_CATEGORY, type: 'value', nativeIsAsync: true, paletteParams: ['pin'], params: ['"D4"']},
  {func: 'analogWrite', parent: api, category: MAKERLAB_CATEGORY, paletteParams: ['pin', 'value'], params: ['5', '150']},
  {func: 'analogRead', parent: api, category: MAKERLAB_CATEGORY, type: 'value', nativeIsAsync: true, paletteParams: ['pin'], params: ['5']},

  /**
   * Circuit-Playground-specific blocks
   */
  {func: 'onBoardEvent', parent: api, category: CIRCUIT_CATEGORY, paletteParams: ['component', 'event', 'callback'], params: ['buttonL', '"press"', "function(event) {\n  \n}"], dropdown: { 0: Object.keys(eventDropdowns), 1: boardEventDropdownGenerator }},

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
  {func: 'buzzer.play', category: CIRCUIT_CATEGORY, paletteParams: ['song'], params: [JSON.stringify(playSongConfig)]},

  // TODO(bjordan): re-add when dropdowns work with object refs
  //{func: 'accelerometer', category: CIRCUIT_CATEGORY, type: 'readonlyproperty', noAutocomplete: true},
  {func: 'accelerometer.getOrientation', category: CIRCUIT_CATEGORY, type: 'value', paletteParams: ['orientationType'], params: ['"inclination"'], dropdown: {0: ['"inclination"', '"pitch"', '"roll"']}},
  {func: 'accelerometer.getAcceleration', category: CIRCUIT_CATEGORY, type: 'value', paletteParams: ['orientationType'], params: ['"x"'], dropdown: {0: ['"x"', '"y"', '"z"', '"total"']}},
  {func: 'accelerometer.start', category: CIRCUIT_CATEGORY},
  {func: 'accelerometer.sensitivity', category: CIRCUIT_CATEGORY, type: 'property' },

  {func: 'value', blockPrefix: `${touchSensorVariables[0]}.`, category: CIRCUIT_CATEGORY, tipPrefix: touchSensorType, modeOptionName: '*.value', objectDropdown: {options: touchSensorVariables}, type: 'readonlyproperty'},
  {func: 'sensitivity', blockPrefix: `${touchSensorVariables[0]}.`, category: CIRCUIT_CATEGORY, tipPrefix: touchSensorType, modeOptionName: '*.sensitivity', objectDropdown: {options: touchSensorVariables}, type: 'property'},

  // TODO(bjordan): re-add when dropdowns work with object refs
  //{func: 'buttonL', category: CIRCUIT_CATEGORY, type: 'readonlyproperty', noAutocomplete: true},
  //{func: 'buttonR', category: CIRCUIT_CATEGORY, type: 'readonlyproperty', noAutocomplete: true},
  {func: 'isPressed', objectDropdown: {options: buttonVariables, dropdownOnly: true}, category: CIRCUIT_CATEGORY, blockPrefix: `${buttonVariables[0]}.`, modeOptionName: "*.isPressed", type: 'readonlyproperty', tipPrefix: '[Button].'},
  {func: 'holdtime', objectDropdown: {options: buttonVariables, dropdownOnly: true}, category: CIRCUIT_CATEGORY, blockPrefix: `${buttonVariables[0]}.`, modeOptionName: "*.holdtime", type: 'readonlyproperty', tipPrefix: '[Button].'},

  {func: 'value', objectDropdown: { options: sensorVariables }, modeOptionName: "*.value", blockPrefix: `${sensorVariables[0]}.`, category: CIRCUIT_CATEGORY, type: 'readonlyproperty', tipPrefix: '[Sensor].'},
  {func: 'getAveragedValue', objectDropdown: { options: sensorVariables }, modeOptionName: "*.getAveragedValue", blockPrefix: `${sensorVariables[0]}.`, category: CIRCUIT_CATEGORY, tipPrefix: '[Sensor].', params: ['500'], paletteParams: ['ms'], type: 'value'},
  {func: 'start', objectDropdown: { options: sensorVariables }, modeOptionName: "*.start", blockPrefix: `${sensorVariables[0]}.`, category: CIRCUIT_CATEGORY, tipPrefix: '[Sensor].'},
  {func: 'setScale', objectDropdown: { options: sensorVariables }, modeOptionName: "*.setScale", blockPrefix: `${sensorVariables[0]}.`, category: CIRCUIT_CATEGORY, tipPrefix: '[Sensor].', params: ['0', '100'], paletteParams: ['low', 'high']},
  {func: 'threshold', objectDropdown: { options: sensorVariables }, modeOptionName: "*.threshold", blockPrefix: `${sensorVariables[0]}.`, category: CIRCUIT_CATEGORY, type: 'property', tipPrefix: '[Sensor].' },

  // TODO(bjordan): re-add when dropdowns work with object refs
  //{func: 'toggleSwitch', category: CIRCUIT_CATEGORY, type: 'readonlyproperty', noAutocomplete: true},
  {func: 'toggleSwitch.isOpen', category: CIRCUIT_CATEGORY, type: 'readonlyproperty' },
];

module.exports.categories = {
  [MAKERLAB_CATEGORY]: {
    color: 'cyan',
    rgb: COLOR_CYAN,
    blocks: []
  },
  [CIRCUIT_CATEGORY]: {
    color: 'lightgreen',
    rgb: COLOR_LIGHT_GREEN,
    blocks: []
  },
};
