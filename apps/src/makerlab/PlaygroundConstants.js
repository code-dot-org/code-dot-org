export const N_COLOR_LEDS = 10;
export const TOUCH_PINS = [0, 1, 2, 3, 6, 9, 10, 12];

export const TOUCH_SENSOR_VARS = _.map(TOUCH_PINS, pin => `touchSensor${pin}`);
export const SENSOR_VARS = ['soundSensor', 'lightSensor', 'tempSensor'];
export const BUTTON_VARS = ['buttonL', 'buttonR'];

const BUTTON_EVENTS = ['press', 'down', 'up'];
const SENSOR_EVENTS = ['change', 'data'];
const TOUCH_EVENTS = ['touch'];

export const COMPONENT_EVENTS = {
  buttonL: BUTTON_EVENTS,
  buttonR: BUTTON_EVENTS,
  toggleSwitch: ['open', 'close'],
  accelerometer: ['change', 'data']
};
SENSOR_VARS.forEach(s => COMPONENT_EVENTS[s] = SENSOR_EVENTS);
TOUCH_SENSOR_VARS.forEach(s => COMPONENT_EVENTS[s] = TOUCH_EVENTS);
