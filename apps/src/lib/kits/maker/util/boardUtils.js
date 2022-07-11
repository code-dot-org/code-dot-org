import {
  ADAFRUIT_VID,
  CIRCUIT_PLAYGROUND_EXPRESS_PID,
  CIRCUIT_PLAYGROUND_PID,
  MICROBIT_PID,
  MICROBIT_VID
} from '../portScanning';
import WebSerialPortWrapper from '@cdo/apps/lib/kits/maker/WebSerialPortWrapper';

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
    const {vendorId, productId} = port;
    const parsedVendorId = vendorId ? parseInt(vendorId, 16) : null;
    const parsedProductId = productId ? parseInt(productId, 16) : null;
    if (
      (vendorId === ADAFRUIT_VID && productId === CIRCUIT_PLAYGROUND_PID) ||
      (parsedVendorId === ADAFRUIT_VID &&
        parsedProductId === CIRCUIT_PLAYGROUND_PID)
    ) {
      boardType = BOARD_TYPE.CLASSIC;
    } else if (
      (vendorId === ADAFRUIT_VID &&
        productId === CIRCUIT_PLAYGROUND_EXPRESS_PID) ||
      (parsedVendorId === ADAFRUIT_VID &&
        parsedProductId === CIRCUIT_PLAYGROUND_EXPRESS_PID)
    ) {
      boardType = BOARD_TYPE.EXPRESS;
    } else if (
      (vendorId === MICROBIT_VID && productId === MICROBIT_PID) ||
      (parsedVendorId === MICROBIT_VID && parsedProductId === MICROBIT_PID)
    ) {
      boardType = BOARD_TYPE.MICROBIT;
    }
  }
  return boardType;
}

/**
 * Determines whether the serial port is WebSerial Port. Otherwise, port is assumed to be Node SerialPort.
 */
export function isWebSerialPort(port) {
  return port instanceof WebSerialPortWrapper;
}

/** @const {number} serial port transfer rate */
export const SERIAL_BAUD = 57600;

// Filter available ports to the boards we support
export const WEB_SERIAL_FILTERS = [
  {usbVendorId: ADAFRUIT_VID, usbProductId: CIRCUIT_PLAYGROUND_PID},
  {usbVendorId: ADAFRUIT_VID, usbProductId: CIRCUIT_PLAYGROUND_EXPRESS_PID},
  {usbVendorId: MICROBIT_VID, usbProductId: MICROBIT_PID}
];
