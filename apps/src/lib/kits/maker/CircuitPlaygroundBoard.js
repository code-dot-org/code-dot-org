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

// Polyfill node's process.hrtime for the browser, gets used by johnny-five.
process.hrtime = require('browser-process-hrtime');

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
    return Promise.resolve()
        .then(() => this.connectToFirmware())
        .then(() => this.initializeComponents())
        .then(() => this.initializeEventForwarding());
  }

  /**
   * Open the serial port connection and create a johnny-five board controller.
   * Exposed as a separate step here for the sake of the setup page; generally
   * recommended to just call connect(), above.
   * @return {Promise}
   */
  connectToFirmware() {
    return new Promise((resolve, reject) => {
      const serialPort = CircuitPlaygroundBoard.openSerialPort(this.portName_);
      const playground = CircuitPlaygroundBoard.makePlaygroundTransport(serialPort);
      const board = new five.Board({io: playground, repl: false, debug: false});
      board.once('ready', () => {
        this.fiveBoard_ = board;
        resolve();
      });
      board.once('error', reject);
    });
  }

  /**
   * Initialize a set of johnny-five component controllers.
   * Exposed as a separate step here for the sake of the setup page; generally
   * it'd be better to just call connect(), above.
   * @throws {Error} if called before connecting to firmware
   */
  initializeComponents() {
    if (!this.fiveBoard_) {
      throw new Error('Cannot initialize components: Not connected to board firmware.');
    }

    this.prewiredComponents_ = {
      board: this.fiveBoard_,
      ...initializeCircuitPlaygroundComponents(this.fiveBoard_),
      ...J5_CONSTANTS
    };
  }

  /**
   * Forward events from individual components out to listeners attached to
   * this EventEmitter.
   * @private
   * @throws {Error} if called before connecting to firmware
   */
  initializeEventForwarding() {
    if (!this.fiveBoard_) {
      throw new Error('Cannot initialize event forwarding: Not connected to board firmware.');
    }

    this.fiveBoard_.on('disconnect', () => this.emit('disconnect'));
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

  onBoardEvent(component, event, callback) {
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
