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

export const MB_API = 'microbit';

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
  'LightSensor',
  'ExternalButton',
  'ExternalLed',
  'CapacitiveTouchSensor'
];

export const MB_BUTTON_VARS = ['buttonA', 'buttonB'];
export const MB_SENSOR_VARS = ['lightSensor', 'tempSensor'];

// milliseconds between samples for sensors
export const SAMPLE_INTERVAL = 50;

// Max number of milliseconds for which we store historical data
export const MAX_SENSOR_BUFFER_DURATION = 3000;

export const MAX_LIGHT_SENSOR_VALUE = 255;

const BUTTON_EVENTS = ['down', 'up'];
const SENSOR_EVENTS = ['change', 'data'];

export const MB_COMPONENT_EVENTS = {
  buttonA: BUTTON_EVENTS,
  buttonB: BUTTON_EVENTS,
  accelerometer: ['change', 'data', 'shake']
};
MB_SENSOR_VARS.forEach(sensor => (MB_COMPONENT_EVENTS[sensor] = SENSOR_EVENTS));

export const MICROBIT_FIRMWARE_VERSION = 'micro:bit Firmata 1.1';

export const SQUARE_LEDS = [
  [0, 0],
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 4],
  [4, 3],
  [4, 2],
  [4, 1],
  [4, 0],
  [3, 0],
  [2, 0],
  [1, 0]
];

export const CHECKMARK_LEDS = [
  [0, 4],
  [1, 3],
  [2, 2],
  [3, 1],
  [4, 0],
  [0, 2],
  [0, 3]
];

let allLeds = [];
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    allLeds.push([i, j]);
  }
}
export const ALL_LEDS = allLeds;
