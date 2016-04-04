/**
 * @file Serial connection and board component initialization logic for Makerlab
 */
/* global Promise */

var five = require('johnny-five');
var ChromeSerialPort = require('chrome-serialport');
var PlaygroundIO = require('playground-io');
require("babelify/polyfill"); // required for Promises in IE / Phantom

/** @const {string} */
var CHROME_APP_ID = 'himpmjbkjeenflliphlaaeggkkanoglo';

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
  this.prewiredComponents = this.prewiredComponents ||
      initializeCircuitPlaygroundComponents();

  codegen.customMarshalObjectList = [
    {instance: five.Led},
    {instance: five.Led.RGB},
    {instance: five.Button},
    {instance: five.Switch},
    {instance: five.Piezo},
    {instance: five.Thermometer},
    {instance: five.Sensor},
    {instance: five.Gyro}
  ];

  Object.keys(this.prewiredComponents).forEach(function (key) {
    jsInterpreter.createGlobalProperty(key, this.prewiredComponents[key]);
  }.bind(this));
};

BoardController.prototype.reset = function () {
  if (!this.board_) {
    return;
  }

  this.board_.register.forEach(function (component) {
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
      if (component.removeAllListeners) {
        component.removeAllListeners();
      }
    } catch (error) {
      console.log('Error trying to cleanup component', error);
      console.log(component);
    }
  });
};

function connect() {
  return getDevicePort().then(connectToBoard);
}

function connectToBoard(portId) {
  return new Promise(function (resolve, reject) {
    var serialPort = new ChromeSerialPort.SerialPort(portId, {
      baudrate: 57600
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

function deviceOnPortAppearsUsable(port) {
  return port.comName.match(/usbmodem/);
}

/**
 * Initializes a set of Johnny-Five components for the currently connected
 * Circuit Playground board.
 * @returns {Object.<String, Object>} board components
 */
function initializeCircuitPlaygroundComponents() {
  return {
    pixels: Array.from({length: 10}, function (_, index) {
      return new five.Led.RGB({
        controller: PlaygroundIO.Pixel,
        pin: index
      });
    }),

    led: new five.Led(13),

    buttonL: new five.Button('4', {
      isPullup: true,
      invert: true
    }),

    buttonR: new five.Button('19', {
      isPullup: true,
      invert: true
    }),

    toggle: new five.Switch('21'),

    piezo: new five.Piezo({
      pin: '5',
      controller: PlaygroundIO.Piezo
    }),

    thermometer: new five.Thermometer({
      controller: "TINKERKIT",
      pin: "A0",
      freq: 100
    }),

    light: new five.Sensor({
      pin: "A5",
      freq: 100
    }),

    sound: new five.Sensor({
      pin: "A4",
      freq: 100
    }),

    gyro: new five.Gyro({
      controller: PlaygroundIO.Gyro
    })
  };
}
