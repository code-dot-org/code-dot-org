import _ from 'lodash';

import {getFirstParam} from '../dropletUtils';
import color from '../util/color';

import * as api from './api';
import {
  N_COLOR_LEDS,
  CP_BUTTON_VARS,
  CP_COMPONENT_EVENTS,
  SONG_CHARGE,
  SONG_SINGLE_NOTE,
} from './boards/circuitPlayground/PlaygroundConstants';
import {
  MB_BUTTON_VARS,
  MB_SENSOR_VARS,
  MB_ACCELEROMETER_VAR,
  MB_COMPONENT_EVENTS,
} from './boards/microBit/MicroBitConstants';

const config = {};
export default config;

const MAKER_CATEGORY = 'Maker';
config.MAKER_CATEGORY = MAKER_CATEGORY;
const CIRCUIT_CATEGORY = 'Circuit';
const MICROBIT_CATEGORY = 'micro:bit';

const emptySocketPrefix = '__.';

const pixelType = '[ColorLed].';
const colorPixelVariables = _.range(N_COLOR_LEDS).map(
  index => `colorLeds[${index}]`
);
const colorLedBlockPrefix = `${colorPixelVariables[0]}.`;

function stringifySong(song) {
  return '[' + song.map(note => `${JSON.stringify(note)}`).join(', ') + ']';
}
config.stringifySong = stringifySong;

/**
 * Generate an array of dropdown strings appropriate for the second
 * parameter to onBoardEvent, given a particular first parameter to
 * onBoardEvent.
 * @param {string} firstParam - first parameter to onBoardEvent
 */
function getBoardEventDropdownForParam(firstParam, componentEvents) {
  const wrapInQuotes = e => `"${e}"`;
  const idealOptions = componentEvents[firstParam];
  if (Array.isArray(idealOptions)) {
    return _.chain(idealOptions).sort().sortedUniq().map(wrapInQuotes).value();
  }

  // If we can't find an ideal subset, use all possible
  return _.chain(componentEvents)
    .values()
    .flatten()
    .sort()
    .sortedUniq()
    .map(wrapInQuotes)
    .value();
}
config.getBoardEventDropdownForParam = getBoardEventDropdownForParam;

// Block properties we'll reuse in multiple entries
function createMakerPinProps(defaultParam) {
  return {
    parent: api,
    category: MAKER_CATEGORY,
    paletteParams: ['pin'],
    params: [defaultParam],
  };
}

/**
 * Color LED-related blocks that we'll reuse in multiple categories
 *
 * Note: in order to differentiate blocks between different categories, we can prepend
 * the blockPrefix to the func name directly, as blocks with the same func name are
 * considered the same block. However, in order to not break existing levels, we also
 * temporarily need to support versions of these blocks without the blockPrefix prepended
 * directly. We can use the {@param includePrefixInFunc} flag to support both these versions.
 * Once we've stopped using the old versions of these blocks (without the prefix directly in
 * the func name), we can remove this flag.
 */
function sharedColorLedBlocks({
  category,
  blockPrefix,
  objectDropdown,
  includePrefixInFunc,
}) {
  return [
    {
      func: `${includePrefixInFunc ? blockPrefix : ''}on`,
      blockPrefix: includePrefixInFunc ? undefined : blockPrefix,
      category,
      tipPrefix: pixelType,
      modeOptionName: '*.on',
      objectDropdown,
    },
    {
      func: `${includePrefixInFunc ? blockPrefix : ''}off`,
      blockPrefix: includePrefixInFunc ? undefined : blockPrefix,
      category,
      tipPrefix: pixelType,
      modeOptionName: '*.off',
      objectDropdown,
    },
    {
      func: `${includePrefixInFunc ? blockPrefix : ''}toggle`,
      blockPrefix: includePrefixInFunc ? undefined : blockPrefix,
      category,
      tipPrefix: pixelType,
      modeOptionName: '*.toggle',
      objectDropdown,
    },
    {
      func: `${includePrefixInFunc ? blockPrefix : ''}blink`,
      blockPrefix: includePrefixInFunc ? undefined : blockPrefix,
      category,
      paletteParams: ['interval'],
      params: ['100'],
      tipPrefix: pixelType,
      modeOptionName: '*.blink',
      objectDropdown,
    },
    {
      func: `${includePrefixInFunc ? blockPrefix : ''}pulse`,
      blockPrefix: includePrefixInFunc ? undefined : blockPrefix,
      category,
      paletteParams: ['interval'],
      params: ['300'],
      tipPrefix: pixelType,
      modeOptionName: '*.pulse',
      objectDropdown,
    },
  ];
}

/**
 * Maker drawer blocks used by both Circuit Playground and Micro:Bit
 */
export function getMakerBlocks(boardType) {
  let defaultPin = '"A6"';
  if (boardType === MICROBIT_CATEGORY) {
    defaultPin = '0';
  }
  return [
    {
      func: 'pinMode',
      parent: api,
      category: MAKER_CATEGORY,
      paletteParams: ['pin', 'mode'],
      params: [defaultPin, '"output"'],
      dropdown: {1: ['"output"', '"input"', '"analog"']},
    },
    {
      func: 'digitalWrite',
      parent: api,
      category: MAKER_CATEGORY,
      paletteParams: ['pin', 'value'],
      params: [defaultPin, '1'],
      dropdown: {1: ['1', '0']},
    },
    {
      func: 'digitalRead',
      parent: api,
      category: MAKER_CATEGORY,
      type: 'value',
      nativeIsAsync: true,
      paletteParams: ['pin'],
      params: [defaultPin],
    },
    {
      func: 'analogWrite',
      parent: api,
      category: MAKER_CATEGORY,
      paletteParams: ['pin', 'value'],
      params: [defaultPin, '150'],
    },
    {
      func: 'analogRead',
      parent: api,
      category: MAKER_CATEGORY,
      type: 'value',
      nativeIsAsync: true,
      paletteParams: ['pin'],
      params: [defaultPin],
    },
    {
      func: 'boardConnected',
      parent: api,
      category: MAKER_CATEGORY,
      type: 'value',
    },
    {func: 'exit', category: MAKER_CATEGORY, noAutocomplete: true},

    {
      func: 'createLed',
      ...createMakerPinProps(defaultPin),
      type: 'either',
    },
    {
      func: 'var myLed = createLed',
      ...createMakerPinProps(defaultPin),
      noAutocomplete: true,
      docFunc: 'createLed',
    },

    ...sharedColorLedBlocks({
      category: MAKER_CATEGORY,
      blockPrefix: emptySocketPrefix,
      includePrefixInFunc: true,
    }),

    ...sharedColorLedBlocks({
      category: MAKER_CATEGORY,
      blockPrefix: emptySocketPrefix,
      includePrefixInFunc: false,
    }),

    {
      func: 'createButton',
      ...createMakerPinProps(defaultPin),
      type: 'either',
    },
    {
      func: 'var myButton = createButton',
      ...createMakerPinProps(defaultPin),
      noAutocomplete: true,
      docFunc: 'createButton',
    },
  ];
}

/**
 * Circuit-Playground-specific blocks
 */
const circuitPlaygroundBlocks = [
  {
    func: 'onBoardEvent',
    parent: api,
    category: CIRCUIT_CATEGORY,
    paletteParams: ['component', 'event', 'callback'],
    params: ['buttonL', '"down"', 'function() {\n  \n}'],
    allowFunctionDrop: {2: true},
    dropdown: {
      0: Object.keys(CP_COMPONENT_EVENTS),
      1: function (editor) {
        return getBoardEventDropdownForParam(
          getFirstParam('onBoardEvent', this.parent, editor),
          CP_COMPONENT_EVENTS
        );
      },
    },
  },

  {
    func: 'led',
    category: CIRCUIT_CATEGORY,
    type: 'readonlyproperty',
    noAutocomplete: true,
  },
  {func: 'led.on', category: CIRCUIT_CATEGORY},
  {func: 'led.off', category: CIRCUIT_CATEGORY},
  {
    func: 'led.blink',
    category: CIRCUIT_CATEGORY,
    paletteParams: ['interval'],
    params: ['200'],
  },
  {func: 'led.toggle', category: CIRCUIT_CATEGORY},
  {
    func: 'led.pulse',
    category: CIRCUIT_CATEGORY,
    paletteParams: ['interval'],
    params: ['200'],
  },

  {func: 'colorLeds', category: CIRCUIT_CATEGORY, type: 'readonlyproperty'},

  ...sharedColorLedBlocks({
    category: CIRCUIT_CATEGORY,
    blockPrefix: colorLedBlockPrefix,
    objectDropdown: {options: colorPixelVariables},
    includePrefixInFunc: true,
  }),

  ...sharedColorLedBlocks({
    category: CIRCUIT_CATEGORY,
    blockPrefix: colorLedBlockPrefix,
    objectDropdown: {options: colorPixelVariables},
    includePrefixInFunc: false,
  }),

  {
    func: 'intensity',
    blockPrefix: colorLedBlockPrefix,
    category: CIRCUIT_CATEGORY,
    params: ['25'],
    tipPrefix: pixelType,
    modeOptionName: '*.intensity',
    objectDropdown: {options: colorPixelVariables},
  },
  {
    func: 'color',
    blockPrefix: colorLedBlockPrefix,
    category: CIRCUIT_CATEGORY,
    paletteParams: ['color'],
    params: ['"#FF00FF"'],
    paramButtons: {minArgs: 1, maxArgs: 3},
    tipPrefix: pixelType,
    modeOptionName: '*.color',
    objectDropdown: {options: colorPixelVariables},
  },

  {
    func: 'buzzer',
    category: CIRCUIT_CATEGORY,
    type: 'readonlyproperty',
    noAutocomplete: true,
  },
  {
    func: 'buzzer.frequency',
    category: CIRCUIT_CATEGORY,
    paletteParams: ['frequency', 'duration'],
    params: ['500', '100'],
    paramButtons: {minArgs: 1, maxArgs: 2},
  },
  {
    func: 'buzzer.note',
    category: CIRCUIT_CATEGORY,
    paletteParams: ['note', 'duration'],
    params: ['"A4"', '100'],
    paramButtons: {minArgs: 1, maxArgs: 2},
  },
  {func: 'buzzer.off', category: CIRCUIT_CATEGORY},
  {func: 'buzzer.stop', category: CIRCUIT_CATEGORY},

  {
    func: 'buzzer.play',
    category: CIRCUIT_CATEGORY,
    paletteParams: ['notes', 'tempo'],
    params: [stringifySong(SONG_CHARGE), 120],
    paramButtons: {minArgs: 1, maxArgs: 2},
  },
  {
    func: 'buzzer.playNotes',
    category: CIRCUIT_CATEGORY,
    paletteParams: ['notes', 'tempo'],
    params: [stringifySong(SONG_SINGLE_NOTE), 120],
    paramButtons: {minArgs: 1, maxArgs: 2},
  },
  {
    func: 'buzzer.playSong',
    category: CIRCUIT_CATEGORY,
    paletteParams: ['notes', 'tempo'],
    params: [`[${stringifySong(SONG_CHARGE[0])}]`, 120],
    paramButtons: {minArgs: 1, maxArgs: 2},
  },
  {
    func: 'accelerometer.getOrientation',
    category: CIRCUIT_CATEGORY,
    type: 'value',
    paletteParams: ['orientationType'],
    params: ['"inclination"'],
    dropdown: {0: ['"inclination"', '"pitch"', '"roll"']},
  },
  {
    func: 'accelerometer.getAcceleration',
    category: CIRCUIT_CATEGORY,
    type: 'value',
    paletteParams: ['orientationType'],
    params: ['"x"'],
    dropdown: {0: ['"x"', '"y"', '"z"', '"total"']},
  },
  {func: 'accelerometer.start', category: CIRCUIT_CATEGORY},
  {
    func: 'accelerometer.sensitivity',
    category: CIRCUIT_CATEGORY,
    type: 'property',
  },

  // Known issue - objectDropdown doesn't work with type:'readonlyproperty'
  {
    func: 'isPressed',
    objectDropdown: {options: CP_BUTTON_VARS, dropdownOnly: true},
    category: CIRCUIT_CATEGORY,
    blockPrefix: `${CP_BUTTON_VARS[0]}.`,
    modeOptionName: '*.isPressed',
    type: 'readonlyproperty',
    tipPrefix: '[Button].',
  },
  // Known issue - objectDropdown doesn't work with type:'readonlyproperty'
  {
    func: 'holdtime',
    objectDropdown: {options: CP_BUTTON_VARS, dropdownOnly: true},
    category: CIRCUIT_CATEGORY,
    blockPrefix: `${CP_BUTTON_VARS[0]}.`,
    modeOptionName: '*.holdtime',
    type: 'readonlyproperty',
    tipPrefix: '[Button].',
  },

  {func: 'soundSensor.start', category: CIRCUIT_CATEGORY, noAutocomplete: true},
  {
    func: 'soundSensor.value',
    category: CIRCUIT_CATEGORY,
    type: 'readonlyproperty',
  },
  {
    func: 'soundSensor.setScale',
    category: CIRCUIT_CATEGORY,
    params: ['0', '100'],
    paletteParams: ['low', 'high'],
  },
  {func: 'soundSensor.threshold', category: CIRCUIT_CATEGORY, type: 'property'},

  {func: 'lightSensor.start', category: CIRCUIT_CATEGORY, noAutocomplete: true},
  {
    func: 'lightSensor.value',
    category: CIRCUIT_CATEGORY,
    type: 'readonlyproperty',
  },
  {
    func: 'lightSensor.setScale',
    category: CIRCUIT_CATEGORY,
    params: ['0', '100'],
    paletteParams: ['low', 'high'],
  },
  {func: 'lightSensor.threshold', category: CIRCUIT_CATEGORY, type: 'property'},

  {func: 'tempSensor.F', category: CIRCUIT_CATEGORY, type: 'readonlyproperty'},
  {func: 'tempSensor.C', category: CIRCUIT_CATEGORY, type: 'readonlyproperty'},

  {
    func: 'toggleSwitch.isOpen',
    category: CIRCUIT_CATEGORY,
    type: 'readonlyproperty',
  },
];

/* micro:bit specific blocks */
const microBitBlocks = [
  {
    func: 'createCapacitiveTouchSensor',
    ...createMakerPinProps('"A6"'),
    type: 'either',
  },
  {
    func: 'var mySensor = createCapacitiveTouchSensor',
    ...createMakerPinProps('"A6"'),
    noAutocomplete: true,
    docFunc: 'createCapacitiveTouchSensor',
  },
  {
    func: 'onBoardEvent',
    parent: api,
    category: MICROBIT_CATEGORY,
    paletteParams: ['component', 'event', 'callback'],
    params: ['buttonA', '"down"', 'function() {\n  \n}'],
    allowFunctionDrop: {2: true},
    dropdown: {
      0: Object.keys(MB_COMPONENT_EVENTS),
      1: function (editor) {
        return getBoardEventDropdownForParam(
          getFirstParam('onBoardEvent', this.parent, editor),
          MB_COMPONENT_EVENTS
        );
      },
    },
  },
  {
    func: 'ledScreen',
    category: MICROBIT_CATEGORY,
    type: 'readonlyproperty',
  },
  {
    func: 'ledScreen.on',
    category: MICROBIT_CATEGORY,
    params: ['0', '0'],
    paletteParams: ['x', 'y'],
  },
  {
    func: 'ledScreen.off',
    category: MICROBIT_CATEGORY,
    params: ['0', '0'],
    paletteParams: ['x', 'y'],
  },
  {
    func: 'ledScreen.toggle',
    category: MICROBIT_CATEGORY,
    params: ['0', '0'],
    paletteParams: ['x', 'y'],
  },
  {
    func: 'ledScreen.clear',
    category: MICROBIT_CATEGORY,
  },
  {
    func: 'ledScreen.scrollNumber',
    category: MICROBIT_CATEGORY,
    params: ['100'],
    paletteParams: ['number'],
  },
  {
    func: 'ledScreen.scrollString',
    category: MICROBIT_CATEGORY,
    params: ['"Hello World!"'],
    paletteParams: ['string'],
  },

  {
    func: 'ledScreen.display',
    category: MICROBIT_CATEGORY,
    params: [
      '[\n([1, 1, 1, 1, 1]),\n([1, 1, 1, 1, 1]),\n([1, 1, 1, 1, 1]),\n([1, 1, 1, 1, 1]),\n([1, 1, 1, 1, 1])\n]',
    ],
    paletteParams: ['boardArray'],
  },
  {
    func: 'isPressed',
    objectDropdown: {options: MB_BUTTON_VARS, dropdownOnly: true},
    category: MICROBIT_CATEGORY,
    blockPrefix: `${MB_BUTTON_VARS[0]}.`,
    modeOptionName: '*.isPressed',
    type: 'readonlyproperty',
    tipPrefix: '[Button].',
  },
  {
    func: 'accelerometer.getOrientation',
    category: MICROBIT_CATEGORY,
    type: 'value',
    paletteParams: ['orientationType'],
    params: ['"inclination"'],
    dropdown: {0: ['"inclination"', '"pitch"', '"roll"']},
  },
  {
    func: 'accelerometer.getAcceleration',
    category: MICROBIT_CATEGORY,
    type: 'value',
    paletteParams: ['orientationType'],
    params: ['"x"'],
    dropdown: {0: ['"x"', '"y"', '"z"', '"total"']},
  },
  {
    func: 'lightSensor.start',
    category: MICROBIT_CATEGORY,
    noAutocomplete: true,
  },
  {
    func: 'lightSensor.value',
    category: MICROBIT_CATEGORY,
    type: 'readonlyproperty',
  },
  {
    func: 'lightSensor.setScale',
    category: MICROBIT_CATEGORY,
    params: ['0', '100'],
    paletteParams: ['low', 'high'],
  },
  {
    func: 'lightSensor.threshold',
    category: MICROBIT_CATEGORY,
    type: 'property',
  },
  {
    func: 'tempSensor.F',
    category: MICROBIT_CATEGORY,
    type: 'readonlyproperty',
  },
  {
    func: 'tempSensor.C',
    category: MICROBIT_CATEGORY,
    type: 'readonlyproperty',
  },
];

config.categories = {
  [MAKER_CATEGORY]: {
    color: 'cyan',
    rgb: color.droplet_cyan,
    blocks: [],
  },
};

export let configMicrobit = {
  categories: {
    [MICROBIT_CATEGORY]: {
      id: 'microbit',
      color: 'red',
      rgb: color.droplet_red,
      blocks: [],
    },
  },
  blocks: [...getMakerBlocks(MICROBIT_CATEGORY), ...microBitBlocks],
  additionalPredefValues: [
    ...MB_BUTTON_VARS,
    ...MB_SENSOR_VARS,
    MB_ACCELEROMETER_VAR,
  ],
};

export let configCircuitPlayground = {
  categories: {
    [CIRCUIT_CATEGORY]: {
      id: 'circuitPlayground',
      color: 'red',
      rgb: color.droplet_red,
      blocks: [],
    },
  },
  blocks: [...getMakerBlocks(CIRCUIT_CATEGORY), ...circuitPlaygroundBlocks],
  additionalPredefValues: Object.keys(CP_COMPONENT_EVENTS),
};
