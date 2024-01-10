import {
  MICROBIT_VENDOR_ID,
  MICROBIT_PRODUCT_ID,
} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitConstants';
import {
  ADAFRUIT_VENDOR_ID,
  CIRCUIT_PLAYGROUND_CLASSIC_PRODUCT_ID,
  CIRCUIT_PLAYGROUND_EXPRESS_PRODUCT_ID,
} from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/PlaygroundConstants';
import WebSerialPortWrapper from '@cdo/apps/lib/kits/maker/WebSerialPortWrapper';
import {isChromeOS, getChromeVersion} from '../util/browserChecks';
import {MIN_CHROME_VERSION} from '@cdo/apps/lib/kits/maker/util/makerConstants';

export const BOARD_TYPE = {
  CLASSIC: 'classic',
  EXPRESS: 'express',
  MICROBIT: 'microbit',
  OTHER: 'other',
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
      (vendorId === ADAFRUIT_VENDOR_ID &&
        productId === CIRCUIT_PLAYGROUND_CLASSIC_PRODUCT_ID) ||
      (parsedVendorId === ADAFRUIT_VENDOR_ID &&
        parsedProductId === CIRCUIT_PLAYGROUND_CLASSIC_PRODUCT_ID)
    ) {
      boardType = BOARD_TYPE.CLASSIC;
    } else if (
      (vendorId === ADAFRUIT_VENDOR_ID &&
        productId === CIRCUIT_PLAYGROUND_EXPRESS_PRODUCT_ID) ||
      (parsedVendorId === ADAFRUIT_VENDOR_ID &&
        parsedProductId === CIRCUIT_PLAYGROUND_EXPRESS_PRODUCT_ID)
    ) {
      boardType = BOARD_TYPE.EXPRESS;
    } else if (
      (vendorId === MICROBIT_VENDOR_ID && productId === MICROBIT_PRODUCT_ID) ||
      (parsedVendorId === MICROBIT_VENDOR_ID &&
        parsedProductId === MICROBIT_PRODUCT_ID)
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

/**
 * Determines whether WebSerial port is available in the current browser.
 * WebSerial should be available in ChromeOS (depending on version after WebSerial was released)
 * and in Chromium browsers.
 */
export function shouldUseWebSerial() {
  const webSerialAvailableInBrowser = 'serial' in navigator;
  const usingChromeOS =
    isChromeOS() && getChromeVersion() >= MIN_CHROME_VERSION;
  return usingChromeOS || webSerialAvailableInBrowser;
}

/** @const {number} serial port transfer rate */
export const SERIAL_BAUD = 57600;

// Filter available ports to the boards we support
export const WEB_SERIAL_FILTERS = [
  {
    usbVendorId: ADAFRUIT_VENDOR_ID,
    usbProductId: CIRCUIT_PLAYGROUND_CLASSIC_PRODUCT_ID,
  },
  {
    usbVendorId: ADAFRUIT_VENDOR_ID,
    usbProductId: CIRCUIT_PLAYGROUND_EXPRESS_PRODUCT_ID,
  },
  {usbVendorId: MICROBIT_VENDOR_ID, usbProductId: MICROBIT_PRODUCT_ID},
];

export const delayPromise = t => new Promise(resolve => setTimeout(resolve, t));
