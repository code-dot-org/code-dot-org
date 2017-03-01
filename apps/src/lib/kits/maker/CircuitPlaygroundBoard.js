/** @file Board controller for Adafruit Circuit Playground */
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser
import ChromeSerialPort from 'chrome-serialport';
import five from 'johnny-five';
import Playground from 'playground-io';
import {
  initializeCircuitPlaygroundComponents,
  componentConstructors
} from './PlaygroundComponents';
import {BOARD_EVENT_ALIASES} from './PlaygroundConstants';

/** @const {number} serial port transfer rate */
const SERIAL_BAUD = 57600;

const J5_CONSTANTS = {
  INPUT: 0,
  OUTPUT: 1,
  ANALOG: 2,
  PWM: 3,
  SERVO: 4
};

/**
 * Controller interface for an Adafruit Circuit Playground board using
 * Circuit Playground Firmata firmware.
 */
export default class CircuitPlaygroundBoard extends EventEmitter {
  constructor(portName) {
    super();

    /** @private {string} a port identifier, e.g. "/dev/ttyACM0" */
    this.portName_ = portName;

    /** @private {five.Board} A johnny-five board controller */
    this.fiveBoard_ = null;

    /** @private {Object} Map of component controllers */
    this.prewiredComponents_ = null;
  }

  /**
   * Open a connection to the board on its configured port.
   * @return {Promise}
   */
  connect() {
    return new Promise((resolve, reject) => {
      const serialPort = CircuitPlaygroundBoard.openSerialPort(this.portName_);
      const playground = CircuitPlaygroundBoard.makePlaygroundTransport(serialPort);
      const board = new five.Board({io: playground, repl: false, debug: false});
      board.once('ready', () => {
        this.fiveBoard_ = board;
        this.prewiredComponents_ = {
          board,
          ...initializeCircuitPlaygroundComponents(board),
          ...J5_CONSTANTS
        };
        resolve();
      });
      board.once('error', reject);
      board.on('disconnect', () => this.emit('disconnect'));
    });
  }

  /**
   * Disconnect and clean up the board controller and all components.
   */
  destroy() {
    // Investigate: What do we need to tear down here?
    this.prewiredComponents_ = null;

    if (this.fiveBoard_) {
      this.fiveBoard_.io.reset();
    }
    this.fiveBoard_ = null;
  }

  /**
   * Marshals the board component controllers and appropriate constants into the
   * given JS Interpreter instance so they can be used by student code.
   * @param {codegen} codegen
   * @param {JSInterpreter} jsInterpreter
   */
  installOnInterpreter(codegen, jsInterpreter) {
    Object.keys(componentConstructors).forEach(key => {
      codegen.customMarshalObjectList.push({instance: componentConstructors[key]});
      jsInterpreter.createGlobalProperty(key, componentConstructors[key]);
    });

    Object.keys(this.prewiredComponents_).forEach(key => {
      jsInterpreter.createGlobalProperty(key, this.prewiredComponents_[key]);
    });
  }

  pinMode(pin, modeConstant) {
    this.fiveBoard_.pinMode(pin, modeConstant);
  }

  digitalWrite(pin, value) {
    this.fiveBoard_.digitalWrite(pin, value);
  }

  digitalRead(pin, callback) {
    return this.fiveBoard_.digitalRead(pin, callback);
  }

  analogWrite(pin, value) {
    this.fiveBoard_.analogWrite(pin, value);
  }

  analogRead(pin, callback) {
    return this.fiveBoard_.analogRead(pin, callback);
  }

  onBoardEvent(...args) {
    CircuitPlaygroundBoard.onBoardEvent(...args);
  }

  static onBoardEvent(component, event, callback) {
    if (BOARD_EVENT_ALIASES[event]) {
      event = BOARD_EVENT_ALIASES[event];
    }
    component.on(event, callback);
  }

  /**
   * Create a serial port controller and open the serial port immediately.
   * @param {string} portName
   * @return {SerialPort}
   */
  static openSerialPort(portName) {
    return new ChromeSerialPort.SerialPort(portName, {
      bitrate: SERIAL_BAUD
    }, true);
  }

  /**
   * Create a playground-io controller attached to the given serial port.
   * @param {SerialPort} serialPort
   * @return {Playground}
   */
  static makePlaygroundTransport(serialPort) {
    const playground = new Playground({ port: serialPort });
    // Circuit Playground Firmata does not seem to proactively report its
    // version, meaning we were hitting the default 5000ms timeout waiting
    // for this on every connection attempt.
    // Here we explicitly request a version as soon as the serialport is open
    // to speed up the connection process.
    playground.on("open", function () {
      // Requesting the version requires both of these calls. ¯\_(ツ)_/¯
      playground.reportVersion(function () {});
      playground.queryFirmware(function () {});
    });
    return playground;
  }
}
