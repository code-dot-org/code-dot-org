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
    let vendorId = port.vendorId;
    let productId = port.productId;
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
  return port instanceof WebSerialPortWrapper;
}

/** @const {number} serial port transfer rate */
export const SERIAL_BAUD = 57600;
