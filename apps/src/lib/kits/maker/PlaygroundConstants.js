export const N_COLOR_LEDS = 10;
export const TOUCH_PINS = [0, 1, 2, 3, 6, 9, 10, 12];

export const SENSOR_VARS = ['soundSensor', 'lightSensor', 'tempSensor'];
export const BUTTON_VARS = ['buttonL', 'buttonR'];
const TOUCH_PAD_VARS = TOUCH_PINS.map(pin => `touchPad${pin}`);

const BUTTON_EVENTS = ['press', 'down', 'up'];
const SENSOR_EVENTS = ['change', 'data'];
const TOUCH_EVENTS = ['down', 'up'];

export const COMPONENT_EVENTS = {
  buttonL: BUTTON_EVENTS,
  buttonR: BUTTON_EVENTS,
  toggleSwitch: ['open', 'close'],
  accelerometer: ['change', 'data', 'singleTap', 'doubleTap']
};
SENSOR_VARS.forEach(s => COMPONENT_EVENTS[s] = SENSOR_EVENTS);
TOUCH_PAD_VARS.forEach(s => COMPONENT_EVENTS[s] = TOUCH_EVENTS);

export const BOARD_EVENT_ALIASES = {
  // codeStudioName: 'playground-io-name'
  singleTap: 'tap:single',
  doubleTap: 'tap:double'
};
