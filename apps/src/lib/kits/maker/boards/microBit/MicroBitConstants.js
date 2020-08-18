export const SENSOR_CHANNELS = {
  accelX: 8,
  accelY: 9,
  accelZ: 10,
  lightSensor: 11,
  tempSensor: 12,
  magX: 13,
  magY: 14
};
export const EXTERNAL_PINS = [0, 1, 2];

export function roundToHundredth(rawValue) {
  return Math.floor(rawValue * 100) / 100;
}

// Component count includes values for board component and accounts for
// button A and button B
export const MB_COMPONENT_COUNT = 8;

export const MB_COMPONENTS = [
  'LedScreen',
  'MicroBitButton',
  'Accelerometer',
  'MicroBitThermometer',
  'Compass',
  'LightSensor'
];

export const MB_BUTTON_VARS = ['buttonA', 'buttonB'];
export const MB_SENSOR_VARS = [
  'soundSensor',
  'lightSensor',
  'tempSensor',
  'compass'
];

// milliseconds between samples for sensors
export const SAMPLE_RATE = 50;

// Max number of milliseconds for which we store historical data
export const MAX_SENSOR_BUFFER = 3000;

const BUTTON_EVENTS = ['down', 'up'];
const SENSOR_EVENTS = ['change', 'data'];

export const MB_COMPONENT_EVENTS = {
  buttonA: BUTTON_EVENTS,
  buttonB: BUTTON_EVENTS,
  accelerometer: ['change', 'data', 'shake']
};
MB_SENSOR_VARS.forEach(sensor => (MB_COMPONENT_EVENTS[sensor] = SENSOR_EVENTS));
