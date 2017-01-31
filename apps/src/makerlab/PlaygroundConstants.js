export const N_COLOR_LEDS = 10;
export const TOUCH_PINS = [0, 1, 2, 3, 6, 9, 10, 12];

export const SENSOR_VARS = ['soundSensor', 'lightSensor', 'tempSensor'];
export const BUTTON_VARS = ['buttonL', 'buttonR'];

const BUTTON_EVENTS = ['press', 'down', 'up'];
const SENSOR_EVENTS = ['change', 'data'];
const TOUCH_PIN_EVENTS = {};
TOUCH_PINS.forEach(pin => {
  TOUCH_PIN_EVENTS[`touchPad${pin}`] = ['down', 'up'];
});

export const COMPONENT_EVENTS = Object.assign({}, TOUCH_PIN_EVENTS, {
  buttonL: BUTTON_EVENTS,
  buttonR: BUTTON_EVENTS,
  toggleSwitch: ['open', 'close'],
  accelerometer: ['change', 'data']
});
SENSOR_VARS.forEach(s => COMPONENT_EVENTS[s] = SENSOR_EVENTS);
