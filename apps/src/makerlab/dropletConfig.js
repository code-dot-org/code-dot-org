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

const pixelType = '[ColorLed].';
const colorPixelVariables = Array.from({length: 10}, (_, index) => `colorLeds[${index}]`);
const colorLedBlockPrefix = `${colorPixelVariables[0]}.`;

module.exports.blocks = [
  {func: 'pinMode', parent: api, category: 'Maker Lab', paletteParams: ['pin', 'mode'], params: ['13', '"output"'], dropdown: { 1: ['"output"', '"input"', '"analog"'] }},
  {func: 'digitalWrite', parent: api, category: 'Maker Lab', paletteParams: ['pin', 'value'], params: ['13', '1'], dropdown: { 1: ['1', '0'] }},
  {func: 'digitalRead', parent: api, category: 'Maker Lab', type: 'value', nativeIsAsync: true, paletteParams: ['pin'], params: ['"D4"']},
  {func: 'analogWrite', parent: api, category: 'Maker Lab', paletteParams: ['pin', 'value'], params: ['5', '150']},
  {func: 'analogRead', parent: api, category: 'Maker Lab', type: 'value', nativeIsAsync: true, paletteParams: ['pin'], params: ['5']},

  {func: 'led', category: 'Circuit', type: 'readonlyproperty', noAutocomplete: true},
  {func: 'led.on', category: 'Circuit'},
  {func: 'led.off', category: 'Circuit'},

  {func: 'on', blockPrefix: colorLedBlockPrefix, category: 'Circuit', tipPrefix: pixelType, modeOptionName: '*.on', objectDropdown: {options: colorPixelVariables}},
  {func: 'off', blockPrefix: colorLedBlockPrefix, category: 'Circuit', tipPrefix: pixelType, modeOptionName: '*.off', objectDropdown: {options: colorPixelVariables}},

  {func: 'toggle', blockPrefix: colorLedBlockPrefix, category: 'Circuit', tipPrefix: pixelType, modeOptionName: "*.toggle", objectDropdown: { options: colorPixelVariables }  },
  {func: 'blink', blockPrefix: colorLedBlockPrefix, category: 'Circuit', paletteParams: ['interval'], params: ['100'], tipPrefix: pixelType, modeOptionName: "*.blink", objectDropdown: { options: colorPixelVariables }  },
  {func: 'stop', blockPrefix: colorLedBlockPrefix, category: 'Circuit', tipPrefix: pixelType, modeOptionName: "*.stop", objectDropdown: { options: colorPixelVariables }  },
  {func: 'intensity', blockPrefix: colorLedBlockPrefix, category: 'Circuit', params: ['25'], tipPrefix: pixelType, modeOptionName: "*.intensity", objectDropdown: { options: colorPixelVariables }  },
  {func: 'color', blockPrefix: colorLedBlockPrefix, category: 'Circuit', paletteParams: ['color'], params: ['"#FF00FF"'], tipPrefix: pixelType, modeOptionName: "*.color", objectDropdown: { options: colorPixelVariables }  },

  {func: 'buzzer', category: 'Circuit', type: 'readonlyproperty', noAutocomplete: true},
  {func: 'buzzer.frequency', category: 'Circuit', paletteParams: ['frequency', 'duration'], params: ['500', '100']},
  {func: 'buzzer.note', category: 'Circuit', paletteParams: ['note', 'duration'], params: ['"A4"', '100']},
  {func: 'buzzer.stop', category: 'Circuit'},
  {func: 'buzzer.play', category: 'Circuit', paletteParams: ['song'], params: [JSON.stringify(playSongConfig)]},

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
