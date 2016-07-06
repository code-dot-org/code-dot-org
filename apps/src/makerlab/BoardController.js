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

import {initializeCircuitPlaygroundComponents, TouchSensor} from './PlaygroundComponents';

/** @const {string} */
const CHROME_APP_ID = 'ncmmhcpckfejllekofcacodljhdhibkg';
const J5_CONSTANTS = {
  INPUT: 0,
  OUTPUT: 1,
  ANALOG: 2,
  PWM: 3,
  SERVO: 4
};

var BoardController = module.exports = function () {
  ChromeSerialPort.extensionId = CHROME_APP_ID;

  /** @private {five.Board} */
  this.board_ = null;

  this.prewiredComponents = null;
};

BoardController.prototype.connectAndInitialize = function (codegen, interpreter) {
  return this.ensureBoardConnected()
      .then(this.installComponentsOnInterpreter.bind(this, codegen, interpreter))
      .catch(function (error) {
        console.log("Board initialization failed:");
        console.log(error);
      });
};

/**
 * Connects to board if not already connected.
 */
BoardController.prototype.ensureBoardConnected = function () {
  return new Promise(function (resolve, reject) {
    ChromeSerialPort.isInstalled(function (error) {
      if (error) {
        reject(error);
        return;
      }

      if (this.board_) {
        resolve();
        return;
      }

      connect()
          .then(function (board) {
            this.board_ = board;
            resolve();
          }.bind(this))
          .catch(reject);
    }.bind(this));
  }.bind(this));
};

BoardController.prototype.installComponentsOnInterpreter = function (codegen, jsInterpreter) {
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
  var componentConstructors = {
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

BoardController.prototype.reset = function () {
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
  var standaloneComponents = [
    this.prewiredComponents.tap,
    this.prewiredComponents.touch
  ];
  this.board_.register.concat(standaloneComponents).forEach(resetComponent);
};

BoardController.prototype.pinMode = function (pin, modeConstant) {
  this.board_.pinMode(pin, modeConstant);
};

BoardController.prototype.digitalWrite = function (pin, value) {
  this.board_.digitalWrite(pin, value);
};

BoardController.prototype.digitalRead = function (pin, callback) {
  return this.board_.digitalRead(pin, callback);
};

BoardController.prototype.analogWrite = function (pin, value) {
  this.board_.analogWrite(pin, value);
};

BoardController.prototype.analogRead = function (pin, callback) {
  return this.board_.analogRead(pin, callback);
};

BoardController.prototype.onBoardEvent = function (component, event, callback) {
  component.on(event, callback);
};

function connect() {
  return getDevicePort().then(connectToBoard);
}

function connectToBoard(portId) {
  return new Promise(function (resolve, reject) {
    var serialPort = new ChromeSerialPort.SerialPort(portId, {
      bitrate: 57600
    }, true);
    var io = new PlaygroundIO({port: serialPort});
    var board = new five.Board({io: io, repl: false});
    board.once('ready', function () {
      resolve(board);
    });
    board.once('error', reject);
  }.bind(this));
}

function getDevicePort() {
  return new Promise(function (resolve, reject) {
    ChromeSerialPort.list(function (error, list) {
      if (error) {
        reject(error);
        return;
      }

      var prewiredBoards = list.filter(function (port) {
        return deviceOnPortAppearsUsable(port);
      });

      if (prewiredBoards.length > 0) {
        resolve(prewiredBoards[0].comName);
      } else {
        reject('Could not get device port.');
      }
    });
  }.bind(this));
}

/**
 * Returns whether the given descriptor's serialport is potentially an Arduino
 * device.
 *
 * Based on logic in johnny-five lib/board.js, match ports that Arduino cares
 * about, like: ttyUSB#, cu.usbmodem#, COM#
 *
 * @param {Object} port node-serial compatible serialport info object
 * @returns {boolean} whether this is potentially an Arduino device
 */
function deviceOnPortAppearsUsable(port) {
  var comNameRegex = /usb|acm|^com/i;
  return comNameRegex.test(port.comName);
}

BoardController.__testonly__ = {
  deviceOnPortAppearsUsable: deviceOnPortAppearsUsable,
  getDevicePort: getDevicePort
};
