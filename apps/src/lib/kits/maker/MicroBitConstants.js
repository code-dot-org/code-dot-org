export const sensor_channels = {
  accelX: 8,
  accelY: 9,
  accelZ: 10,
  tempSensor: 12
};
export const EXTERNAL_PINS = [0, 1, 2];

export function roundToHundredth(rawValue) {
  return Math.floor(rawValue * 100) / 100;
}
