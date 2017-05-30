export const N_COLOR_LEDS = 10;
export const TOUCH_PINS = [0, 1, 2, 3, 6, 9, 10, 12];
export const J5_CONSTANTS = {
  INPUT: 0,
  OUTPUT: 1,
  ANALOG: 2,
  PWM: 3,
  SERVO: 4
};

export const SENSOR_VARS = ['soundSensor', 'lightSensor', 'tempSensor'];
export const BUTTON_VARS = ['buttonL', 'buttonR'];
// TODO (captouch)
// const TOUCH_PAD_VARS = TOUCH_PINS.map(pin => `touchPad${pin}`);

const BUTTON_EVENTS = ['press', 'down', 'up'];
const SENSOR_EVENTS = ['change', 'data'];
// TODO (captouch)
// const TOUCH_EVENTS = ['down', 'up'];

export const COMPONENT_EVENTS = {
  buttonL: BUTTON_EVENTS,
  buttonR: BUTTON_EVENTS,
  toggleSwitch: ['open', 'close'],
  accelerometer: ['change', 'data', 'singleTap', 'doubleTap']
};
SENSOR_VARS.forEach(s => COMPONENT_EVENTS[s] = SENSOR_EVENTS);
// TODO (captouch)
// TOUCH_PAD_VARS.forEach(s => COMPONENT_EVENTS[s] = TOUCH_EVENTS);

export const BOARD_EVENT_ALIASES = {
  // codeStudioName: 'playground-io-name'
  singleTap: 'tap:single',
  doubleTap: 'tap:double'
};

// For use with Piezo.play()
export const SONG_CHARGE = [
  ['G3', 1/4], ['C4', 1/4], ['E4', 1/4], ['G4', 1/8],
  [null, 3/8], ['E4', 3/16], ['G4', 1]
];

// Circuit playground command codes for certain needed overrides
// See playground-io/lib/index.js
export const CP_COMMAND = 0x40;
export const CP_ACCEL_STREAM_ON = 0x3A;
