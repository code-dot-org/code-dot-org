/** @file Serialport scanning logic for Maker Toolkit */
/* global SerialPort */ // Maybe provided by the Code.org Browser
import ChromeSerialPort from 'chrome-serialport';
import {ConnectionFailedError} from './MakerError';

/**
 * @typedef {Object} SerialPortInfo
 * @property {string} comName (a port id) e.g. "COM3" or "/dev/ttyACM0"
 * @property {string} manufacturer e.g. "Adafruit Circuit Playground"
 * @property {string} productId e.g. "0x8011"
 * @property {string} vendorId e.g. "0x239a"
 */

/** @const {string} */
const CHROME_APP_ID = 'ncmmhcpckfejllekofcacodljhdhibkg';

/** @const {string} Adafruit's vendor id as reported by Circuit Playground boards */
export const ADAFRUIT_VID = 0x239a;

/** @const {string} The Circuit Playground product id as reported by Circuit playground boards */
export const CIRCUIT_PLAYGROUND_PID = 0x8011;

/** @const {string} The Circuit Playground Express product id */
export const CIRCUIT_PLAYGROUND_EXPRESS_PID = 0x8018;

/**
 * Scan system serial ports for a device compatible with Maker Toolkit.
 * @returns {Promise.<string>} resolves to a serial port name for a viable
 *   device, or rejects if no such device can be found.
 */
export function findPortWithViableDevice() {
  return Promise.resolve()
      .then(ensureAppInstalled)
      .then(listSerialDevices)
      .then(list => {
        const bestOption = getPreferredPort(list);
        if (bestOption) {
          return bestOption.comName;
        } else {
          return Promise.reject(new ConnectionFailedError(
              'Did not find a usable device on a serial port. ' +
              '\n\nFound devices: ' + JSON.stringify(list)));
        }
      });
}

/**
 * Check whether the Code.org Serial Connector Chrome extension is available.
 * @returns {Promise} Resolves if installed, rejects if not.
 */
export function ensureAppInstalled() {
  if (isNodeSerialAvailable()) {
    return Promise.resolve();
  }

  ChromeSerialPort.extensionId = CHROME_APP_ID;
  return new Promise((resolve, reject) => {
    ChromeSerialPort.isInstalled((error) => error ? reject(error) : resolve());
  });
}

/**
 * Ask the serial port bridge extension for a list of connected devices.
 * @returns {Promise.<Array.<SerialPortInfo>>}
 */
function listSerialDevices() {
  const SerialPortType = isNodeSerialAvailable() ? SerialPort : ChromeSerialPort;
  return new Promise((resolve, reject) => {
    SerialPortType.list((error, list) => error ? reject(error) : resolve(list));
  });
}

/**
 * @returns {boolean} Whether node SerialPort is available on window, where it
 * is provided if we're using the Code.org Browser.
 */
export function isNodeSerialAvailable() {
  return typeof SerialPort === 'function';
}

/**
 * Given a collection of serial port configurations, pick the one that is
 * most likely to be compatible with maker toolkit.
 * @param {Array.<SerialPortInfo>} portList
 * @return {SerialPortInfo|undefined} the best option, if one is found
 */
export function getPreferredPort(portList) {
  // 1. Best case: Correct vid and pid
  const adafruitCircuitPlayground = portList.find(port =>
    parseInt(port.vendorId, 16) === ADAFRUIT_VID &&
    parseInt(port.productId, 16) === CIRCUIT_PLAYGROUND_PID);
  if (adafruitCircuitPlayground) {
    return adafruitCircuitPlayground;
  }

  // 2. Next-best case: Circuit Playground Express
  const adafruitExpress = portList.find(port =>
    parseInt(port.vendorId, 16) === ADAFRUIT_VID &&
    parseInt(port.productId, 16) === CIRCUIT_PLAYGROUND_EXPRESS_PID);
  if (adafruitExpress) {
    return adafruitExpress;
  }

  // 3. Next best case: Some other Adafruit product that might also work
  const otherAdafruit = portList.find(port => parseInt(port.vendorId, 16) === ADAFRUIT_VID);
  if (otherAdafruit) {
    return otherAdafruit;
  }

  // 4. Last-ditch effort: Anything with a probably-usable port name and
  //    a valid vendor id and product id
  const comNameRegex = /usb|acm|^com/i;
  return portList.find(port => {
    const {comName, vendorId, productId} = port;
    return comNameRegex.test(comName)
      && parseInt(vendorId, 16) > 0
      && parseInt(productId, 16) > 0;
  });
}
