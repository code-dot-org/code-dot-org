/**
 * @file Serial connection and board component initialization logic for Maker Toolkit
 */
/* global Promise */

// Polyfill node's process.hrtime for the browser, gets used by johnny-five.
process.hrtime = require('browser-process-hrtime');

import ChromeSerialPort from 'chrome-serialport';
import {componentConstructors} from './PlaygroundComponents';
import {BOARD_EVENT_ALIASES} from './PlaygroundConstants';
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

export default class BoardController {
  constructor() {
    ChromeSerialPort.extensionId = CHROME_APP_ID;

    /** @private {CircuitPlaygroundBoard} */
    this.cdoBoard_ = null;

    /** @private {function} */
    this.onDisconnectCallback_ = null;
  }

  connectAndInitialize(codegen, interpreter) {
    return BoardController.ensureAppInstalled()
        .then(this.ensureBoardConnected.bind(this))
        .then(this.installComponentsOnInterpreter.bind(this, codegen, interpreter));
  }

  connectWithComponents() {
    return this.ensureBoardConnected();
  }

  static ensureAppInstalled() {
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
   * Connects to board if not already connected.
   */
  ensureBoardConnected() {
    return new Promise((resolve, reject) => {
      if (this.cdoBoard_) {
        // Already connected, just use existing board.
        resolve();
        return;
      }

      BoardController.connect()
          .then(board => {
            this.cdoBoard_ = board;
            this.cdoBoard_.on('disconnect', this.handleDisconnect_.bind(this));
            resolve();
          })
          .catch(reject);
    });
  }

  installComponentsOnInterpreter(codegen, jsInterpreter) {
    Object.keys(componentConstructors).forEach(key => {
      codegen.customMarshalObjectList.push({instance: componentConstructors[key]});
      jsInterpreter.createGlobalProperty(key, componentConstructors[key]);
    });

    Object.keys(this.cdoBoard_.prewiredComponents_).forEach(key => {
      jsInterpreter.createGlobalProperty(key, this.cdoBoard_.prewiredComponents_[key]);
    });
  }

  onceOnDisconnect(cb) {
    this.onDisconnectCallback_ = cb;
  }

  handleDisconnect_() {
    if (typeof this.onDisconnectCallback_ === 'function') {
      this.onDisconnectCallback_();
      this.onDisconnectCallback_ = null;
    }
  }

  reset() {
    if (this.cdoBoard_) {
      this.cdoBoard_.destroy();
    }
    this.cdoBoard_ = null;
  }

  pinMode(pin, modeConstant) {
    this.cdoBoard_.pinMode(pin, modeConstant);
  }

  digitalWrite(pin, value) {
    this.cdoBoard_.digitalWrite(pin, value);
  }

  digitalRead(pin, callback) {
    return this.cdoBoard_.digitalRead(pin, callback);
  }

  analogWrite(pin, value) {
    this.cdoBoard_.analogWrite(pin, value);
  }

  analogRead(pin, callback) {
    return this.cdoBoard_.analogRead(pin, callback);
  }

  onBoardEvent(component, event, callback) {
    if (BOARD_EVENT_ALIASES[event]) {
      event = BOARD_EVENT_ALIASES[event];
    }
    component.on(event, callback);
  }

  static connect() {
    return BoardController.getDevicePortName()
        .then(BoardController.connectToBoard);
  }

  static connectToBoard(portName) {
    const cdoBoard = new CircuitPlaygroundBoard(portName);
    return cdoBoard.connect().then(() => cdoBoard);
  }

  static getDevicePortName() {
    return new Promise((resolve, reject) => {
      ChromeSerialPort.list((error, list) => {
        if (error) {
          reject(error);
          return;
        }

        const bestOption = BoardController.getPreferredPort(list);
        if (bestOption) {
          resolve(bestOption.comName);
        } else {
          reject('Could not get device port.');
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
  static getPreferredPort(portList) {
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
}
