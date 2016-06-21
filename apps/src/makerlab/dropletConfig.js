/* global dashboard */

import api from '../applab/api';
import _ from '../lodash';
import {getFirstParam} from '../dropletUtils';

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

const pixelType = '[ColorLed].';
const touchSensorType = '[TouchSensor].';
const colorPixelVariables = _.range(10).map(index => `colorLeds[${index}]`);
const touchSensorVariables = _.map([0, 1, 2, 3, 6, 9, 10, 12], index => `touchSensor${index}`);
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
 * Relies on `this` being the dorplet socket when in droplet mode, and, in
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
  {func: 'pinMode', parent: api, category: 'Maker Lab', paletteParams: ['pin', 'mode'], params: ['13', '"output"'], dropdown: { 1: ['"output"', '"input"', '"analog"'] }},
  {func: 'digitalWrite', parent: api, category: 'Maker Lab', paletteParams: ['pin', 'value'], params: ['13', '1'], dropdown: { 1: ['1', '0'] }},
  {func: 'digitalRead', parent: api, category: 'Maker Lab', type: 'value', nativeIsAsync: true, paletteParams: ['pin'], params: ['"D4"']},
  {func: 'analogWrite', parent: api, category: 'Maker Lab', paletteParams: ['pin', 'value'], params: ['5', '150']},
  {func: 'analogRead', parent: api, category: 'Maker Lab', type: 'value', nativeIsAsync: true, paletteParams: ['pin'], params: ['5']},

  {
    func: 'onBoardEvent',
    parent: api,
    category: 'Circuit',
    paletteParams: ['component', 'event', 'callback'],
    params: ['buttonL', '"press"', "function(event) {\n  \n}"],
    dropdown: {
      0: Object.keys(eventDropdowns),
      1: boardEventDropdownGenerator
    }
  },

  //{func: 'led', category: 'Circuit', type: 'readonlyproperty', noAutocomplete: true},
  {func: 'led.on', category: 'Circuit'},
  {func: 'led.off', category: 'Circuit'},

  {func: 'on', blockPrefix: colorLedBlockPrefix, category: 'Circuit', tipPrefix: pixelType, modeOptionName: '*.on', objectDropdown: {options: colorPixelVariables}},
  {func: 'off', blockPrefix: colorLedBlockPrefix, category: 'Circuit', tipPrefix: pixelType, modeOptionName: '*.off', objectDropdown: {options: colorPixelVariables}},

  {func: 'toggle', blockPrefix: colorLedBlockPrefix, category: 'Circuit', tipPrefix: pixelType, modeOptionName: "*.toggle", objectDropdown: { options: colorPixelVariables }  },
  {func: 'blink', blockPrefix: colorLedBlockPrefix, category: 'Circuit', paletteParams: ['interval'], params: ['100'], tipPrefix: pixelType, modeOptionName: "*.blink", objectDropdown: { options: colorPixelVariables }  },
  {func: 'stop', blockPrefix: colorLedBlockPrefix, category: 'Circuit', tipPrefix: pixelType, modeOptionName: "*.stop", objectDropdown: { options: colorPixelVariables }  },
  {func: 'intensity', blockPrefix: colorLedBlockPrefix, category: 'Circuit', params: ['25'], tipPrefix: pixelType, modeOptionName: "*.intensity", objectDropdown: { options: colorPixelVariables }  },
  {func: 'color', blockPrefix: colorLedBlockPrefix, category: 'Circuit', paletteParams: ['color'], params: ['"#FF00FF"'], tipPrefix: pixelType, modeOptionName: "*.color", objectDropdown: { options: colorPixelVariables }  },

  //{func: 'buzzer', category: 'Circuit', type: 'readonlyproperty', noAutocomplete: true},
  {func: 'buzzer.frequency', category: 'Circuit', paletteParams: ['frequency', 'duration'], params: ['500', '100'], paramButtons: { minArgs: 1, maxArgs: 2}},
  {func: 'buzzer.note', category: 'Circuit', paletteParams: ['note', 'duration'], params: ['"A4"', '100'], paramButtons: { minArgs: 1, maxArgs: 2}},
  {func: 'buzzer.off', category: 'Circuit'},
  {func: 'buzzer.stop', category: 'Circuit'},
  {func: 'buzzer.play', category: 'Circuit', paletteParams: ['song'], params: [JSON.stringify(playSongConfig)]},

  //{func: 'accelerometer', category: 'Circuit', type: 'readonlyproperty', noAutocomplete: true},
  {func: 'accelerometer.getOrientation', category: 'Circuit', type: 'value', paletteParams: ['orientationType'], params: ['"inclination"'], dropdown: {0: ['"inclination"', '"pitch"', '"roll"']}},
  {func: 'accelerometer.getAcceleration', category: 'Circuit', type: 'value', paletteParams: ['orientationType'], params: ['"x"'], dropdown: {0: ['"x"', '"y"', '"z"', '"total"']}},
  {func: 'accelerometer.sensitivity', category: 'Circuit', type: 'property' },

  {func: 'value', blockPrefix: `${touchSensorVariables[0]}.`, category: 'Circuit', tipPrefix: touchSensorType, modeOptionName: '*.value', objectDropdown: {options: touchSensorVariables}, type: 'readonlyproperty'},
  {func: 'sensitivity', blockPrefix: `${touchSensorVariables[0]}.`, category: 'Circuit', tipPrefix: touchSensorType, modeOptionName: '*.sensitivity', objectDropdown: {options: touchSensorVariables}, type: 'property'},

  //{func: 'buttonL', category: 'Circuit', type: 'readonlyproperty', noAutocomplete: true},
  //{func: 'buttonR', category: 'Circuit', type: 'readonlyproperty', noAutocomplete: true},
  {func: 'isPressed', objectDropdown: {options: buttonVariables, dropdownOnly: true}, category: 'Circuit', blockPrefix: `${buttonVariables[0]}.`, modeOptionName: "*.isPressed", type: 'readonlyproperty', tipPrefix: '[Button].'},
  {func: 'holdtime', objectDropdown: {options: buttonVariables, dropdownOnly: true}, category: 'Circuit', blockPrefix: `${buttonVariables[0]}.`, modeOptionName: "*.holdtime", type: 'readonlyproperty', tipPrefix: '[Button].'},

  {func: 'value', objectDropdown: { options: sensorVariables }, modeOptionName: "*.value", blockPrefix: `${sensorVariables[0]}.`, category: 'Circuit', type: 'readonlyproperty', tipPrefix: '[Sensor].'},
  {func: 'threshold', objectDropdown: { options: sensorVariables }, modeOptionName: "*.threshold", blockPrefix: `${sensorVariables[0]}.`, category: 'Circuit', type: 'property', tipPrefix: '[Sensor].' },

  //{func: 'toggleSwitch', category: 'Circuit', type: 'readonlyproperty', noAutocomplete: true},
  {func: 'toggleSwitch.isOpen', category: 'Circuit', type: 'readonlyproperty' },
];

module.exports.categories = {
  'Maker Lab': {
    color: 'cyan',
    rgb: COLOR_CYAN,
    blocks: []
  },
  'Circuit': {
    color: 'lightgreen',
    rgb: COLOR_LIGHT_GREEN,
    blocks: []
  },
};



setTimeout(() => $('.lightgreen').last().click(), 3500); // TODO remove
//setTimeout(() => $('.cyan').last().click(), 3500); // TODO remove
