/**
 * @file Serial connection and board component initialization logic for Makerlab
 */
/* global Promise */

try {
  var five = require('johnny-five');
  var ChromeSerialPort = require('chrome-serialport');
  var PlaygroundIO = require('playground-io');
} catch (e) {
  /**
   * These packages should currently only be downloaded and available on
   * /p/makerlab levels, not vanilla App Lab ones, so we ignore any require
   * failures here.
   */
}

import _ from 'lodash';
import {initializeCircuitPlaygroundComponents, TouchSensor} from './PlaygroundComponents';

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
        .then(this.installComponentsOnInterpreter.bind(this, codegen, interpreter));
  }

  /**
   * Connects to board if not already connected.
   */
  ensureBoardConnected() {
    return new Promise(function (resolve, reject) {
      ChromeSerialPort.isInstalled(function (error) {
        if (error) {
          reject(error);
          return;
        }

        if (this.board_) {
          // Already connected, just use existing board.
          resolve();
          return;
        }

        this.connect()
            .then(function (board) {
              this.board_ = board;
              resolve();
            }.bind(this))
            .catch(reject);
      }.bind(this));
    }.bind(this));
  }

  installComponentsOnInterpreter(codegen, jsInterpreter) {
    if (!this.prewiredComponents) {
      this.prewiredComponents = _.assign({},
          initializeCircuitPlaygroundComponents(this.board_.io, five, PlaygroundIO),
          {board: this.board_},
          J5_CONSTANTS);
    }

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
      Piezo: five.Piezo,
      Thermometer: five.Thermometer,
      Sensor: five.Sensor,
      Pin: five.Pin,
      CapTouch: PlaygroundIO.CapTouch,
      Tap: PlaygroundIO.Tap,
      Accelerometer: five.Accelerometer,
      TouchSensor: TouchSensor
    };

    Object.keys(componentConstructors).forEach(function (key) {
      codegen.customMarshalObjectList.push({instance: componentConstructors[key]});
      jsInterpreter.createGlobalProperty(key, componentConstructors[key]);
    });

    Object.keys(this.prewiredComponents).forEach(function (key) {
      jsInterpreter.createGlobalProperty(key, this.prewiredComponents[key]);
    }.bind(this));
  };

  reset() {
    if (!this.board_) {
      return;
    }

    const resetComponent = (component) => {
      try {
        if (component.state && component.state.intervalId) {
          clearInterval(component.state.intervalId);
        } else if (component.state && component.state.interval) {
          clearInterval(component.state.interval);
        }
        if (component.stop) {
          component.stop();
        }
        if (component.off) {
          component.off();
        }
        if (component.threshold) {
          // Reset sensor thresholds to 1.0 in case changed.
          component.threshold = 1;
        }
        if (component.removeAllListeners) {
          component.removeAllListeners();
        }
      } catch (error) {
        console.log('Error trying to cleanup component', error);
        console.log(component);
      }
    };

    // Components which do not get registered with the johnny-five board, but
    // which can be reset in the same way.
    const standaloneComponents = [
      this.prewiredComponents.tap,
      this.prewiredComponents.touch
    ];
    this.board_.register.concat(standaloneComponents).forEach(resetComponent);
  };

  pinMode(pin, modeConstant) {
    this.board_.pinMode(pin, modeConstant);
  };

  digitalWrite(pin, value) {
    this.board_.digitalWrite(pin, value);
  };

  digitalRead(pin, callback) {
    return this.board_.digitalRead(pin, callback);
  };

  analogWrite(pin, value) {
    this.board_.analogWrite(pin, value);
  };

  analogRead(pin, callback) {
    return this.board_.analogRead(pin, callback);
  };

  onBoardEvent(component, event, callback) {
    component.on(event, callback);
  };

  connect() {
    return getDevicePort().then(this.connectToBoard());
  }

  connectToBoard(portId) {
    return new Promise((resolve, reject) => {
      const serialPort = new ChromeSerialPort.SerialPort(portId, {
        bitrate: SERIAL_BAUD
      }, true);
      const io = new PlaygroundIO({port: serialPort});
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
          return deviceOnPortAppearsUsable(port);
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
