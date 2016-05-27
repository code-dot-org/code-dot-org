/* global dashboard */

import api from '../applab/api';

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

const pixelType = '[Pixel]';
const colorPixelVariables = ['pixels', 'pixel0', 'pixel1', 'pixel2', 'pixel3', 'pixel4', 'pixel5', 'pixel6', 'pixel7', 'pixel8', 'pixel9'];
const simpleLedVariables = ['led', ...colorPixelVariables];

module.exports.blocks = [
  {func: 'pinMode', parent: api, category: 'Maker Lab', params: ['13', '"input"']},
  {func: 'digitalWrite', parent: api, category: 'Maker Lab', params: ['13', '1']},
  {func: 'digitalRead', parent: api, category: 'Maker Lab', type: 'value', nativeIsAsync: true, params: ['"D4"']},
  {func: 'analogWrite', parent: api, category: 'Maker Lab', params: ['5', '150']},
  {func: 'analogRead', parent: api, category: 'Maker Lab', type: 'value', nativeIsAsync: true, params: ['5']},

  {func: 'on', blockPrefix: 'led.', category: 'Circuit', tipPrefix: pixelType, modeOptionName: "*.on", objectDropdown: { options: simpleLedVariables, dropdownOnly: true } },
  {func: 'off', blockPrefix: 'led.', category: 'Circuit', tipPrefix: pixelType, modeOptionName: "*.off", objectDropdown: { options: simpleLedVariables, dropdownOnly: true }  },
  {func: 'toggle', blockPrefix: 'led.', category: 'Circuit', tipPrefix: pixelType, modeOptionName: "*.toggle", objectDropdown: { options: simpleLedVariables, dropdownOnly: true }  },
  {func: 'blink', blockPrefix: 'led.', category: 'Circuit', paletteParams: ['period'], params: ['50'], tipPrefix: pixelType, modeOptionName: "*.blink", objectDropdown: { options: simpleLedVariables, dropdownOnly: true }  },
  {func: 'stop', blockPrefix: 'led.', category: 'Circuit', tipPrefix: pixelType, modeOptionName: "*.stop", objectDropdown: { options: simpleLedVariables, dropdownOnly: true }  },
  {func: 'intensity', blockPrefix: 'pixel0.', category: 'Circuit', params: ['25'], tipPrefix: pixelType, modeOptionName: "*.intensity", objectDropdown: { options: colorPixelVariables, dropdownOnly: true }  },
  {func: 'color', blockPrefix: 'pixel0.', category: 'Circuit', paletteParams: ['color'], params: ['"#FF00FF"'], tipPrefix: pixelType, modeOptionName: "*.color", objectDropdown: { options: colorPixelVariables, dropdownOnly: true }  },

  {func: 'piezo', category: 'Circuit', type: 'readonlyproperty', noAutocomplete: true},
  {func: 'piezo.frequency', category: 'Circuit', params: ['500', '100']},
  {func: 'piezo.note', category: 'Circuit', params: ['"A4"', '100']},
  {func: 'piezo.stop', category: 'Circuit'},
  {func: 'piezo.play', category: 'Circuit', paletteParams: ['song'], params: [JSON.stringify(playSongConfig)]},

  {func: 'isPressed', objectDropdown: { options: ['buttonL', 'buttonR'], dropdownOnly: true }, modeOptionName: "*.isPressed", blockPrefix: 'buttonL.', category: 'Circuit', type: 'readonlyproperty', tipPrefix: '[Button].'},
  {func: 'holdtime', blockPrefix: 'buttonL.', category: 'Circuit', type: 'property', tipPrefix: 'button[L/R]' },

  {func: 'toggleSwitch', category: 'Circuit', type: 'readonlyproperty', noAutocomplete: true},
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
