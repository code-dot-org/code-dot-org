import experiments from '../../../../../util/experiments';
export const N_COLOR_LEDS = 10;
export const EXTERNAL_PINS = [0, 1, 2, 3, 6, 9, 10, 12];
export const TOUCH_PINS = [0, 2, 3, 6, 9, 10, 12];
export const J5_CONSTANTS = {
  INPUT: 0,
  OUTPUT: 1,
  ANALOG: 2,
  PWM: 3,
  SERVO: 4
};

export const CP_API = 'circuitPlayground';

export const CP_SENSOR_VARS = ['soundSensor', 'lightSensor', 'tempSensor'];
export const CP_BUTTON_VARS = ['buttonL', 'buttonR'];
const TOUCH_PAD_VARS = TOUCH_PINS.map(pin => `touchPad${pin}`);

const BUTTON_EVENTS = ['down', 'up'];
const SENSOR_EVENTS = ['change', 'data'];
const TOUCH_EVENTS = ['down', 'up'];

export const CP_COMPONENT_EVENTS = {
  buttonL: BUTTON_EVENTS,
  buttonR: BUTTON_EVENTS,
  toggleSwitch: ['open', 'close', 'change'],
  accelerometer: ['change', 'data', 'shake']
};
CP_SENSOR_VARS.forEach(s => (CP_COMPONENT_EVENTS[s] = SENSOR_EVENTS));
if (experiments.isEnabled('maker-captouch')) {
  TOUCH_PAD_VARS.forEach(s => (CP_COMPONENT_EVENTS[s] = TOUCH_EVENTS));
}

export const BOARD_EVENT_ALIASES = {
  // codeStudioName: 'playground-io-name'
  shake: 'tap:single',
  singleTap: 'tap:single',
  doubleTap: 'tap:double'
};

// For use with Piezo.play()
// Preferred tempo: 104
export const SONG_CHARGE = [
  ['G3', 1 / 4],
  ['C4', 1 / 4],
  ['E4', 1 / 4],
  ['G4', 1 / 8],
  [null, 3 / 8],
  ['E4', 3 / 16],
  ['G4', 1]
];

export const SONG_1D = ['B4', null, 'B4', null, 'G#4', 'F#4', 'E4', null, 'E4'];

// Preferred tempo: 80
export const SONG_LEVEL_COMPLETE = [
  ['G#4', 1 / 8],
  [null, 1 / 8],
  ['G#4', 1 / 8],
  ['C#5', 1 / 2]
];

// Preferred tempo: 180
export const SONG_ASCENDING = [
  ['C4', 1 / 3],
  ['D4', 1 / 3],
  ['E4', 1 / 3],
  ['G4', 3 / 12],
  [null, 1 / 12],
  ['C5', 1 / 3],
  ['D5', 1 / 3],
  ['E5', 1 / 3],
  ['G5', 3 / 12],
  [null, 1 / 12],
  ['C6', 1 / 3],
  ['D6', 1 / 3],
  ['E6', 1 / 3],
  ['G6', 3 / 12],
  [null, 1 / 12],
  ['C7', 1 / 16],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32],
  ['G6', 1 / 32],
  ['C7', 1 / 32]
];

// Preferred tempo: 120
export const SONG_CONCLUSION = [
  ['C5', 1 / 4],
  ['A4', 1 / 4],
  ['G4', 1 / 2],
  [null, 1 / 4],
  ['A#4', 1 / 32],
  ['G4', 1 / 32],
  ['A#4', 1 / 32],
  ['G4', 1 / 32],
  ['A#4', 1 / 32],
  ['G4', 1 / 32],
  ['A#4', 1 / 32],
  ['G4', 1 / 32],
  ['A#4', 1 / 32],
  ['G4', 1 / 32],
  ['A#4', 1 / 32],
  ['G4', 1 / 32],
  ['A#4', 1 / 32],
  ['G4', 1 / 32],
  ['A#4', 1 / 32],
  ['G4', 1 / 32],
  ['A#4', 1 / 32],
  ['G4', 1 / 32],
  ['A#4', 1 / 32],
  ['G4', 1 / 32],
  [null, 1 / 4],
  ['B4', 1 / 32],
  ['G4', 1 / 32],
  ['B4', 1 / 32],
  ['G4', 1 / 32],
  ['B4', 1 / 32],
  ['G4', 1 / 32],
  ['B4', 1 / 32],
  ['G4', 1 / 32],
  ['B4', 1 / 32],
  ['G4', 1 / 32],
  ['B4', 1 / 32],
  ['G4', 1 / 32],
  ['B4', 1 / 32],
  ['G4', 1 / 32],
  ['B4', 1 / 32],
  ['G4', 1 / 32],
  ['B4', 1 / 32],
  ['G4', 1 / 32],
  ['B4', 1 / 32],
  ['G4', 1 / 32],
  [null, 1 / 4],
  ['C5', 1 / 32],
  ['E4', 1 / 32],
  ['C5', 1 / 32],
  ['E4', 1 / 32],
  ['C5', 1 / 32],
  ['E4', 1 / 32],
  ['C5', 1 / 32],
  ['E4', 1 / 32],
  ['C5', 1 / 32],
  ['E4', 1 / 32],
  ['C5', 1 / 32],
  ['E4', 1 / 32],
  ['C5', 1 / 32],
  ['E4', 1 / 32]
];

// Circuit playground command codes for certain needed overrides
// See playground-io/lib/index.js
export const CP_COMMAND = 0x40;
export const CP_ACCEL_STREAM_ON = 0x3a;
