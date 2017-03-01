/**
 * @file Serialport scanning and board controller creation for Maker Toolkit.
 */

import ChromeSerialPort from 'chrome-serialport';
import CircuitPlaygroundBoard from './CircuitPlaygroundBoard';

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
export const ADAFRUIT_VID = '0x239a';

/** @const {string} The Circuit Playground product id as reported by Circuit playground boards */
export const CIRCUIT_PLAYGROUND_PID = '0x8011';

/**
 * Establish a connection to a maker board and return a controller for it.
 * @returns {Promise.<CircuitPlaygroundBoard>}}
 */
export function connectToMakerBoard() {
  return Promise.resolve()
      .then(ensureAppInstalled)
      .then(getDevicePortName)
      .then(port => new CircuitPlaygroundBoard(port))
      .then(board => board.connect().then(() => board));
}

/**
 * Check whether the Code.org Serial Connector Chrome extension is usable.
 * @returns {Promise}
 */
export function ensureAppInstalled() {
  ChromeSerialPort.extensionId = CHROME_APP_ID;
  return new Promise((resolve, reject) => {
    ChromeSerialPort.isInstalled(function (error) {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Scan system serial ports for a device compatible with Maker Toolkit.
 * @returns {Promise.<string>} resolves to a serial port name for a viable
 *   device, or rejects if no such device can be found.
 */
export function getDevicePortName() {
  return new Promise((resolve, reject) => {
    ChromeSerialPort.list((error, list) => {
      if (error) {
        reject(error);
        return;
      }

      const bestOption = getPreferredPort(list);
      if (bestOption) {
        resolve(bestOption.comName);
      } else {
        reject(new Error('Did not find a usable device on a serial port.'));
      }
    });
  });
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
  port.vendorId === ADAFRUIT_VID &&
  port.productId === CIRCUIT_PLAYGROUND_PID);
  if (adafruitCircuitPlayground) {
    return adafruitCircuitPlayground;
  }

  // 2. Next best case: Some other Adafruit product that might also work
  const otherAdafruit = portList.find(port => port.vendorId === ADAFRUIT_VID);
  if (otherAdafruit) {
    return otherAdafruit;
  }

  // 3. Last-ditch effort: Anything with a probably-usable port name and
  //    a valid vendor id and product id
  const comNameRegex = /usb|acm|^com/i;
  return portList.find(port => {
    const vendorId = parseInt(port.vendorId, 16);
    const productId = parseInt(port.productId, 16);
    return comNameRegex.test(port.comName) && vendorId > 0 && productId > 0;
  });
}
