var five = require('johnny-five');
var ChromeSerialPort = require('chrome-serialport');
var SerialPort = ChromeSerialPort.SerialPort;
var list = ChromeSerialPort.list;
var isInstalled = ChromeSerialPort.isInstalled;
var PlaygroundIO = require('playground-io');

/** @const {string} */
var CHROME_APP_ID = 'himpmjbkjeenflliphlaaeggkkanoglo';
ChromeSerialPort.extensionId = CHROME_APP_ID;

var BoardController = module.exports = function () {
  /** @private {five.Board} */
  this.board_ = null;

  this.prewiredComponents = null;
};

BoardController.prototype.ensureBoard = function (onError, onComplete) {
  isInstalled(function (error) {
    if (error) {
      onError(error);
      return;
    }

    if (this.board_) {
      onComplete();
      return;
    }

    connect(onError, function (board) {
      this.prewiredComponents = initializeComponents();
      this.board_ = board;
      onComplete();
    }.bind(this));
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

function connect(onConnectError, onComplete) {
  getDevicePort(onConnectError, function (portId) {
    connectToBoard(portId, onComplete, onConnectError);
  });
}

function connectToBoard(portId, onComplete, onConnectError) {
  var serialPort = new SerialPort(portId, {
    baudrate: 57600
  }, true);
  var io = new PlaygroundIO({port: serialPort});
  var board = new five.Board({io: io, repl: false});
  board.once('ready', function () {
    onComplete(board)
  });
  board.once('error', onConnectError);
}

function getDevicePort(onError, onComplete) {
  list(function (e, list) {
    if (e) {
      onError(e);
      return;
    }

    var prewiredBoards = list.filter(function (port) {
      return deviceOnPortAppearsUsable(port);
    });

    if (prewiredBoards.length > 0) {
      onComplete(prewiredBoards[0].comName);
    } else {
      onError('Could not get device port.');
    }
  });
}

function deviceOnPortAppearsUsable(port) {
  return port.comName.match(/usbmodem/);
}

function initializeComponents() {
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
