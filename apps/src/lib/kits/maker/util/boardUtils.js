import {
  ADAFRUIT_VID,
  CIRCUIT_PLAYGROUND_EXPRESS_PID,
  CIRCUIT_PLAYGROUND_PID,
  MICROBIT_PID,
  MICROBIT_VID
} from '../portScanning';

export const BOARD_TYPE = {
  CLASSIC: 'classic',
  EXPRESS: 'express',
  MICROBIT: 'microbit',
  OTHER: 'other'
};
/**
 * Detects the type of board plugged into the serial port. Defaults to BOARD_TYPE.OTHER.
 */
export function detectBoardTypeFromPort(port) {
  let boardType = BOARD_TYPE.OTHER;
  if (port) {
    const vendorId = port.vendorId ? parseInt(port.vendorId, 16) : null;
    const productId = port.productId ? parseInt(port.productId, 16) : null;
    if (vendorId === ADAFRUIT_VID && productId === CIRCUIT_PLAYGROUND_PID) {
      boardType = BOARD_TYPE.CLASSIC;
    } else if (
      vendorId === ADAFRUIT_VID &&
      productId === CIRCUIT_PLAYGROUND_EXPRESS_PID
    ) {
      boardType = BOARD_TYPE.EXPRESS;
    } else if (vendorId === MICROBIT_VID && productId === MICROBIT_PID) {
      boardType = BOARD_TYPE.MICROBIT;
    }
  }
  return boardType;
}
