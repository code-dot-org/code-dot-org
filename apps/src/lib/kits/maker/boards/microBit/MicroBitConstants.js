export const sensor_channels = {
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
