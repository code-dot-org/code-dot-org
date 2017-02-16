/**
 * @file Serial connection and board component initialization logic for Maker Toolkit
 */
/* global Promise */

// Polyfill node's process.hrtime for the browser, gets used by johnny-five.
process.hrtime = require('browser-process-hrtime');

import five from 'johnny-five';
import ChromeSerialPort from 'chrome-serialport';
import PlaygroundIO from 'playground-io';

import _ from 'lodash';
import {initializeCircuitPlaygroundComponents} from './PlaygroundComponents';
import {BOARD_EVENT_ALIASES} from './PlaygroundConstants';
import TouchSensor from './TouchSensor';
import Piezo from './Piezo';

/** @const {string} */
const CHROME_APP_ID = 'ncmmhcpckfejllekofcacodljhdhibkg';

const SERIAL_BAUD = 57600;
const J5_CONSTANTS = {
  INPUT: 0,
  OUTPUT: 1,
  ANALOG: 2,
  PWM: 3,
  SERVO: 4
};

export default class BoardController {
  constructor() {
    ChromeSerialPort.extensionId = CHROME_APP_ID;

    /** @private {five.Board} */
    this.board_ = null;
    /** @private {Object} */
    this.prewiredComponents = null;
  }

  connectAndInitialize(codegen, interpreter) {
    return this.ensureBoardConnected()
        .then(this.ensureAppInstalled())
        .then(this.ensureComponentsInitialized.bind(this))
        .then(this.installComponentsOnInterpreter.bind(this, codegen, interpreter));
  }

  connectWithComponents() {
    return this.ensureBoardConnected()
        .then(this.ensureComponentsInitialized.bind(this));
  }

  ensureAppInstalled() {
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
      if (this.board_) {
        // Already connected, just use existing board.
        resolve();
        return;
      }

      this.connect()
          .then(board => {
            this.board_ = board;
            resolve();
          })
          .catch(reject);
    });
  }

  ensureComponentsInitialized() {
    if (this.prewiredComponents) {
      return;
    }

    this.prewiredComponents = _.assign({},
        initializeCircuitPlaygroundComponents(this.board_),
        {board: this.board_},
        J5_CONSTANTS);
  }

  installComponentsOnInterpreter(codegen, jsInterpreter) {
    /**
     * Set of classes used by interpreter to understand the type of instantiated
     * objects, allowing it to make methods and properties of instances available.
     */
    const componentConstructors = {
      Led: five.Led,
      Board: five.Board,
      RGB: five.Led.RGB,
      Button: five.Button,
      Switch: five.Switch,
      Piezo,
      Thermometer: five.Thermometer,
      Sensor: five.Sensor,
      Pin: five.Pin,
      Accelerometer: five.Accelerometer,
      Animation: five.Animation,
      /**
       * @link https://en.wikipedia.org/wiki/Three_Laws_of_Robotics
       * 1. A robot may not injure a human being or, through inaction, allow a human being to come to harm.
       * 2. A robot must obey orders given it by human beings except where such orders would conflict with the First Law.
       * 3. A robot must protect its own existence as long as such protection does not conflict with the First or Second Law.
       */
      Servo: five.Servo,
      TouchSensor
    };

    Object.keys(componentConstructors).forEach(key => {
      codegen.customMarshalObjectList.push({instance: componentConstructors[key]});
      jsInterpreter.createGlobalProperty(key, componentConstructors[key]);
    });

    Object.keys(this.prewiredComponents).forEach(key => {
      jsInterpreter.createGlobalProperty(key, this.prewiredComponents[key]);
    });
  }

  reset() {
    if (!this.board_) {
      return;
    }
    this.board_.io.reset();
    this.board_ = null;
    this.prewiredComponents = null;
  }

  pinMode(pin, modeConstant) {
    this.board_.pinMode(pin, modeConstant);
  }

  digitalWrite(pin, value) {
    this.board_.digitalWrite(pin, value);
  }

  digitalRead(pin, callback) {
    return this.board_.digitalRead(pin, callback);
  }

  analogWrite(pin, value) {
    this.board_.analogWrite(pin, value);
  }

  analogRead(pin, callback) {
    return this.board_.analogRead(pin, callback);
  }

  onBoardEvent(component, event, callback) {
    if (BOARD_EVENT_ALIASES[event]) {
      event = BOARD_EVENT_ALIASES[event];
    }
    component.on(event, callback);
  }

  connect() {
    return BoardController.getDevicePort().then(port => this.connectToBoard(port));
  }

  connectToBoard(portId) {
    return new Promise((resolve, reject) => {
      const serialPort = new ChromeSerialPort.SerialPort(portId, {
        bitrate: SERIAL_BAUD
      }, true);
      const io = new PlaygroundIO({ port: serialPort });

      // Circuit Playground Firmata does not seem to proactively report its
      // version, meaning we were hitting the default 5000ms timeout waiting
      // for this on every connection attempt.
      // Here we explicitly request a version as soon as the serialport is open
      // to speed up the connection process.
      io.on("open", function () {
        // Requesting the version requires both of these calls. ¯\_(ツ)_/¯
        io.reportVersion(function () {});
        io.queryFirmware(function () {});
      });

      const board = new five.Board({io: io, repl: false});
      board.once('ready', () => resolve(board));
      board.once('error', reject);
    });
  }

  static getDevicePort() {
    return new Promise((resolve, reject) => {
      ChromeSerialPort.list((error, list) => {
        if (error) {
          reject(error);
          return;
        }

        const prewiredBoards = list.filter((port) => {
          return BoardController.deviceOnPortAppearsUsable(port);
        });

        if (prewiredBoards.length > 0) {
          resolve(prewiredBoards[0].comName);
        } else {
          reject('Could not get device port.');
        }
      });
    });
  }

  static deviceOnPortAppearsUsable(port) {
    const comNameRegex = /usb|acm|^com/i;
    return comNameRegex.test(port.comName);
  }
}

BoardController.__testonly__ = {
  deviceOnPortAppearsUsable: BoardController.deviceOnPortAppearsUsable,
  getDevicePort: BoardController.getDevicePort
};
