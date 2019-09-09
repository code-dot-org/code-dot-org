/** @file Board controller for Adafruit Circuit Playground */
/* global SerialPort */ // Maybe provided by the Code.org Browser
import _ from 'lodash';
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser
import ChromeSerialPort from 'chrome-serialport';
import five from '@code-dot-org/johnny-five';
import Playground from 'playground-io';
import experiments from '@cdo/apps/util/experiments';
import Firmata from 'firmata';
import {
  createCircuitPlaygroundComponents,
  cleanupCircuitPlaygroundComponents,
  componentConstructors
} from './PlaygroundComponents';
import {
  SONG_CHARGE,
  SONG_LEVEL_COMPLETE,
  SONG_ASCENDING,
  SONG_CONCLUSION,
  CP_COMMAND,
  J5_CONSTANTS
} from './PlaygroundConstants';
import Button from './Button';
import Led from './Led';
import {
  isNodeSerialAvailable,
  ADAFRUIT_VID,
  CIRCUIT_PLAYGROUND_EXPRESS_PID,
  CIRCUIT_PLAYGROUND_PID
} from './portScanning';

// Polyfill node's process.hrtime for the browser, gets used by johnny-five.
process.hrtime = require('browser-process-hrtime');

/** @const {number} serial port transfer rate */
const SERIAL_BAUD = 57600;

/** Maps the Circuit Playground Express pins to Circuit Playground Classic*/
const pinMapping = {A0: 12, A1: 6, A2: 9, A3: 10, A4: 3, A5: 2, A6: 0, A7: 1};

export const BOARD_TYPE = {
  CLASSIC: 'classic',
  EXPRESS: 'express',
  OTHER: 'other'
};

/**
 * Controller interface for an Adafruit Circuit Playground board using
 * Circuit Playground Firmata firmware.
 * @extends EventEmitter
 * @implements MakerBoard
 */
export default class CircuitPlaygroundBoard extends EventEmitter {
  constructor(port) {
    super();

    /** @private {string} a port identifier, e.g. "/dev/ttyACM0" */
    this.port_ = port;

    /** @private {SerialPort} serial port controller */
    this.serialPort_ = null;

    /** @private {five.Board} A johnny-five board controller */
    this.fiveBoard_ = null;

    /** @private {Object} Map of component controllers */
    this.prewiredComponents_ = null;

    /** @private {Array} List of dynamically-created component controllers. */
    this.dynamicComponents_ = [];

    /** @private {string} a board identifier, e.g. "classic" */
    this.boardType_ = BOARD_TYPE.OTHER;
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
      const name = this.port_ ? this.port_.comName : undefined;
      const serialPort = CircuitPlaygroundBoard.openSerialPort(name);
      const playground = CircuitPlaygroundBoard.makePlaygroundTransport(
        serialPort
      );
      const board = new five.Board({io: playground, repl: false, debug: false});
      board.once('ready', () => {
        this.serialPort_ = serialPort;
        this.fiveBoard_ = board;
        this.fiveBoard_.samplingInterval(100);
        this.boardType_ = this.detectBoardType();
        if (experiments.isEnabled('detect-board')) {
          this.detectFirmwareVersion(playground);
        }
        resolve();
      });
      board.on('error', reject);
      playground.on('error', reject);
    });
  }

  /**
   * Helper to detect the firmware (major and minor) version of the given playground
   * @param playground
   */
  detectFirmwareVersion(playground) {
    playground.queryFirmware(() => {
      console.log(
        playground.firmware.version.major +
          '.' +
          playground.firmware.version.minor
      );
    });
  }

  /**
   * Detects the type of board plugged into the serial port
   */
  detectBoardType() {
    const vendorId =
      this.port_ && this.port_.vendorId
        ? parseInt(this.port_.vendorId, 16)
        : null;
    const productId =
      this.port_ && this.port_.productId
        ? parseInt(this.port_.productId, 16)
        : null;
    let boardType = BOARD_TYPE.OTHER;
    if (vendorId === ADAFRUIT_VID && productId === CIRCUIT_PLAYGROUND_PID) {
      boardType = BOARD_TYPE.CLASSIC;
    } else if (
      vendorId === ADAFRUIT_VID &&
      productId === CIRCUIT_PLAYGROUND_EXPRESS_PID
    ) {
      boardType = BOARD_TYPE.EXPRESS;
      if (this.fiveBoard_) {
        this.fiveBoard_.isExpressBoard = true;
      }
    }
    return boardType;
  }

  /**
   * Initialize a set of johnny-five component controllers.
   * Exposed as a separate step here for the sake of the setup page; generally
   * it'd be better to just call connect(), above.
   * @return {Promise}
   * @throws {Error} if called before connecting to firmware
   */
  initializeComponents() {
    if (!this.fiveBoard_) {
      throw new Error(
        'Cannot initialize components: Not connected to board firmware.'
      );
    }
    return createCircuitPlaygroundComponents(this.fiveBoard_).then(
      components => {
        this.prewiredComponents_ = {
          board: this.fiveBoard_,
          ...components,
          ...J5_CONSTANTS
        };
      }
    );
  }

  /**
   * Forward events from individual components out to listeners attached to
   * this EventEmitter.
   * @private
   * @throws {Error} if called before connecting to firmware
   */
  initializeEventForwarding() {
    if (!this.fiveBoard_) {
      throw new Error(
        'Cannot initialize event forwarding: Not connected to board firmware.'
      );
    }

    this.fiveBoard_.on('disconnect', () => this.emit('disconnect'));
  }

  /**
   * Disconnect and clean up the board controller and all components.
   * @return {Promise}
   */
  destroy() {
    this.dynamicComponents_.forEach(component => {
      // For now, these are _always_ Leds.  Complain if they're not.
      if (component instanceof Led) {
        component.stop();
      } else if (component instanceof five.Button) {
        // No special cleanup required for five.Button
      } else {
        throw new Error('Added an unsupported component to dynamic components');
      }
    });
    this.dynamicComponents_.length = 0;

    if (this.prewiredComponents_) {
      cleanupCircuitPlaygroundComponents(
        this.prewiredComponents_,
        true /* shouldDestroyComponents */
      );
    }
    this.prewiredComponents_ = null;

    if (this.fiveBoard_) {
      this.fiveBoard_.io.reset();
    }
    this.fiveBoard_ = null;

    // Deregister Firmata sysex response handler for circuit playground commands,
    // or playground-io will fail to register a new one next time we construct it
    // and the old playground-io instance will get events.
    if (Firmata.SYSEX_RESPONSE) {
      delete Firmata.SYSEX_RESPONSE[CP_COMMAND];
    }
    delete Playground.hasRegisteredSysexResponse;

    return new Promise(resolve => {
      // It can take a moment for the reset() command to reach the board, so defer
      // closing the serialport for a moment.
      setTimeout(() => {
        // Close the serialport, cleaning it up properly so we can open it again
        // on the next run.
        // Note: This doesn't seem to be necessary when using browser-serialport
        // and the Chrome App connector, but it is required for native
        // node serialport in the Code.org Maker App.
        if (this.serialPort_ && typeof this.serialPort_.close === 'function') {
          this.serialPort_.close();
        }
        this.serialPort_ = null;
        resolve();
      }, 50);
    });
  }

  /**
   * Marshals the board component controllers and appropriate constants into the
   * given JS Interpreter instance so they can be used by student code.
   * @param {JSInterpreter} jsInterpreter
   */
  installOnInterpreter(jsInterpreter) {
    Object.keys(componentConstructors).forEach(key => {
      jsInterpreter.addCustomMarshalObject({
        instance: componentConstructors[key]
      });
      jsInterpreter.createGlobalProperty(key, componentConstructors[key]);
    });

    Object.keys(this.prewiredComponents_).forEach(key => {
      jsInterpreter.createGlobalProperty(key, this.prewiredComponents_[key]);
    });
  }

  reset() {
    cleanupCircuitPlaygroundComponents(
      this.prewiredComponents_,
      false /* shouldDestroyComponents */
    );
  }

  /**
   * Play a song and animate some LEDs to demonstrate successful connection
   * to the board.
   * @returns {Promise} resolved when the song and animation are done.
   */
  celebrateSuccessfulConnection() {
    const {buzzer, colorLeds} = this.prewiredComponents_;

    /**
     * Run given function for each LED on the board in sequence, with givcen
     * delay between them.
     * @param {function(five.Led.RGB)} func
     * @param {number} delay in milliseconds
     * @returns {Promise} resolves after func is called for the last LED
     */
    function forEachLedInSequence(func, delay) {
      return new Promise(resolve => {
        colorLeds.forEach((led, i) => {
          setTimeout(() => func(led), delay * (i + 1));
        });
        setTimeout(resolve, delay * colorLeds.length);
      });
    }

    const song = _.sample([
      {notes: SONG_CHARGE, tempo: 104},
      {notes: SONG_LEVEL_COMPLETE, tempo: 80},
      {notes: SONG_ASCENDING, tempo: 180},
      {notes: SONG_CONCLUSION, tempo: 130}
    ]);

    return Promise.resolve()
      .then(() => buzzer.play(song.notes, song.tempo))
      .then(() => forEachLedInSequence(led => led.color('green'), 80))
      .then(() => forEachLedInSequence(led => led.off(), 80));
  }

  mappedPin(pin) {
    return pinMapping.hasOwnProperty(pin) ? pinMapping[pin] : pin;
  }

  pinMode(pin, modeConstant) {
    this.fiveBoard_.pinMode(this.mappedPin(pin), modeConstant);
  }

  digitalWrite(pin, value) {
    this.fiveBoard_.digitalWrite(this.mappedPin(pin), value);
  }

  digitalRead(pin, callback) {
    this.fiveBoard_.digitalRead(this.mappedPin(pin), callback);
  }

  analogWrite(pin, value) {
    this.fiveBoard_.analogWrite(this.mappedPin(pin), value);
  }

  analogRead(pin, callback) {
    this.fiveBoard_.analogRead(this.mappedPin(pin), callback);
  }

  createLed(pin) {
    pin = this.mappedPin(pin);
    const newLed = new Led({board: this.fiveBoard_, pin});
    this.dynamicComponents_.push(newLed);
    return newLed;
  }

  createButton(pin) {
    pin = this.mappedPin(pin);
    const newButton = new Button({board: this.fiveBoard_, pin});
    this.dynamicComponents_.push(newButton);
    return newButton;
  }

  /**
   * @returns {boolean} whether a real board is currently connected or not.
   */
  boardConnected() {
    return !!this.fiveBoard_;
  }

  /**
   * Create a serial port controller and open the serial port immediately.
   * @param {string} portName
   * @return {SerialPort}
   */
  static openSerialPort(portName) {
    // A gotcha here: These two types of SerialPort provide similar, but not
    // exactly equivalent, interfaces.  When making changes to construction
    // here maker sure to test both paths:
    //
    // Code.org Browser case: Native Node SerialPort 6 is available on window.
    //
    // Code.org connector app case: ChromeSerialPort bridges through the Chrome
    // app, implements SerialPort 3's interface.
    const SerialPortType = isNodeSerialAvailable()
      ? SerialPort
      : ChromeSerialPort.SerialPort;

    return new SerialPortType(portName, {
      baudRate: SERIAL_BAUD
    });
  }

  /**
   * Create a playground-io controller attached to the given serial port.
   * @param {SerialPort} serialPort
   * @return {Playground}
   */
  static makePlaygroundTransport(serialPort) {
    const playground = new Playground({port: serialPort});
    // Circuit Playground Firmata does not seem to proactively report its
    // version, meaning we were hitting the default 5000ms timeout waiting
    // for this on every connection attempt.
    // Here we explicitly request a version as soon as the serialport is open
    // to speed up the connection process.
    playground.on('open', function() {
      // Requesting the version requires both of these calls. ¯\_(ツ)_/¯
      playground.reportVersion(function() {});
      playground.queryFirmware(function() {});
    });
    return playground;
  }
}
