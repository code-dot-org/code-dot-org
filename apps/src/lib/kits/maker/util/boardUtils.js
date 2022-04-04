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
    let vendorId;
    let productId;
    if (isWebSerialPort(port)) {
      // WebSerial ports have a getInfo function
      const portInfo = port.getInfo();
      vendorId = portInfo.usbVendorId;
      productId = portInfo.usbProductId;
    } else {
      vendorId = parseInt(port.vendorId, 16);
      productId = parseInt(port.productId, 16);
    }
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

/**
 * Determines whether the serial port is WebSerial Port. Otherwise, port is assumed to be Node SerialPort.
 */
export function isWebSerialPort(port) {
  // The WebSerial API includes a getInfo function on the port. This function is not present for Node SerialPort.
  return port && !!port.getInfo;
}
