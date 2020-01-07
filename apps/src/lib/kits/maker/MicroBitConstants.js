export const sensor_channels = {
  tempSensor: 12
};

export function roundToHundredth(rawValue) {
  return Math.floor(rawValue * 100) / 100;
}
