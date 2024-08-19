import {DOWNLOAD_PREFIX} from '@cdo/apps/maker/util/makerConstants';

export const SENSOR_CHANNELS = {
  accelX: 8,
  accelY: 9,
  accelZ: 10,
  lightSensor: 11,
  tempSensor: 12,
  magX: 13,
  magY: 14,
};
export const EXTERNAL_PINS = [0, 1, 2];

export const MB_API = 'microbit';
export const FIRMWARE_VERSION_TIMEOUT = 'firmwareVersionTimeout';

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
  'LightSensor',
  'ExternalButton',
  'ExternalLed',
  'CapacitiveTouchSensor',
];

export const MB_BUTTON_VARS = ['buttonA', 'buttonB'];
export const MB_SENSOR_VARS = ['lightSensor', 'tempSensor'];
export const MB_ACCELEROMETER_VAR = 'accelerometer';

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
  accelerometer: ['change', 'data', 'shake'],
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
  [1, 0],
];

export const CHECKMARK_LEDS = [
  [0, 4],
  [1, 3],
  [2, 2],
  [3, 1],
  [4, 0],
  [0, 2],
  [0, 3],
];

let allLeds = [];
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    allLeds.push([i, j]);
  }
}
export const ALL_LEDS = allLeds;

export const MICROBIT_FIRMATA_V1_URL = `${DOWNLOAD_PREFIX}microbit-firmata-v1-ver1.2.hex`;
export const MICROBIT_FIRMATA_V2_URL = `${DOWNLOAD_PREFIX}microbit-firmata-v2-ver1.2.hex`;
export const MICROBIT_IDS_V1 = ['9900', '9901'];
export const MICROBIT_IDS_V2 = ['9903', '9904', '9905', '9906'];
export const MICROBIT_V1 = 'v1';
export const MICROBIT_V2 = 'v2';

// Any USB device (including a micro:bit) will identify itself on connection to the
// host computer through three numbers: Vendor ID, Product ID, and serial number.
// We check if the connected board is a micro:bit with the following constants.
export const MICROBIT_VENDOR_ID = 0x0d28;
export const MICROBIT_PRODUCT_ID = 0x0204;
