/** @file Board controller for Adafruit Circuit Playground */
import _ from 'lodash';
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser
import five from '@code-dot-org/johnny-five';
import Playground from 'playground-io';
import experiments from '@cdo/apps/util/experiments';
import Firmata from 'firmata';
import {
  createCircuitPlaygroundComponents,
  cleanupCircuitPlaygroundComponents,
  enableCircuitPlaygroundComponents,
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
import Led from './Led';
import PlaygroundButton from './Button';
import {
  detectBoardTypeFromPort,
  isWebSerialPort,
  BOARD_TYPE
} from '../../util/boardUtils';
import {isChromeOS, serialPortType} from '../../util/browserChecks';
import firehoseClient from '@cdo/apps/lib/util/firehose';

// Polyfill node's process.hrtime for the browser, gets used by johnny-five.
process.hrtime = require('browser-process-hrtime');

/** @const {number} serial port transfer rate */
const SERIAL_BAUD = 57600;

/** Maps the Circuit Playground Express pins to Circuit Playground Classic*/
const pinMapping = {
  A0: 12,
  A1: 6,
  A2: 9,
  A3: 10,
  A4: 3,
  A5: 2,
  A6: 0,
  A7: 1
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
    this.logWithFirehose('serial-port-constructor-set-to-null');

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
      if (isWebSerialPort(this.port_)) {
        const name = this.port_.getInfo().usbProductId;
        CircuitPlaygroundBoard.openSerialPortWebSerial(this.port_).then(
          port => {
            this.initializePlaygroundAndBoard(port, name, resolve, reject);
          }
        );
      } else {
        const name = this.port_ ? this.port_.comName : undefined;
        const serialPort = CircuitPlaygroundBoard.openSerialPort(name);
        this.initializePlaygroundAndBoard(serialPort, name, resolve, reject);
      }
    });
  }

  initializePlaygroundAndBoard(serialPort, name, resolve, reject) {
    const playground = CircuitPlaygroundBoard.makePlaygroundTransport(
      serialPort
    );
    const board = new five.Board({
      io: playground,
      repl: false,
      debug: false
    });
    board.once('ready', () => {
      this.serialPort_ = serialPort;
      this.logWithFirehose(
        'serial-port-set',
        JSON.stringify({serialPort, name})
      );

      this.fiveBoard_ = board;
      this.fiveBoard_.samplingInterval(100);
      this.boardType_ = detectBoardTypeFromPort(this.port_);
      if (this.boardType_ === BOARD_TYPE.EXPRESS) {
        this.fiveBoard_.isExpressBoard = true;
      }
      if (experiments.isEnabled('detect-board')) {
        this.detectFirmwareVersion(playground);
      }
      resolve();
    });
    board.on('error', reject);
    playground.on('error', reject);
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
   * Enable existing board components
   */
  enableComponents() {
    if (this.prewiredComponents_) {
      enableCircuitPlaygroundComponents(this.prewiredComponents_);
    }
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
          this.logWithFirehose('serial-port-closed');
        }
        this.serialPort_ = null;
        this.logWithFirehose('serial-port-cleared');
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
    /*
     * Clear send queue of any pending messages.
     * Important to do this before calling cleanupCircuitPlaygroundComponents. That function
     * resets the state on the various board components, which requires writing to the board.
     * So if we clear the queue after we call cleanupCircuitPlaygroundComponents, but before
     * all of the writes complete, the board will be left in a partially-reset state.
     */
    if (this.serialPort_) {
      this.serialPort_.queue = [];
      this.logWithFirehose('serial-port-queue-cleared');
    } else {
      this.logWithFirehose('serial-port-undefined');
    }

    if (this.prewiredComponents_) {
      cleanupCircuitPlaygroundComponents(
        this.prewiredComponents_,
        false /* shouldDestroyComponents */
      );
    }
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
    const newButton = new PlaygroundButton({board: this.fiveBoard_, pin});
    this.dynamicComponents_.push(newButton);
    return newButton;
  }

  /**
   * @returns {boolean} whether a real board is currently connected or not.
   */
  boardConnected() {
    return !!this.fiveBoard_;
  }

  logWithFirehose(eventString, dataJson = null) {
    firehoseClient.putRecord(
      {
        study: 'maker-serial-port',
        study_group: 'serial-port-lifecycle',
        event: eventString,
        data_json: dataJson
      },
      {includeUserId: true}
    );
  }

  /**
   * Create a serial port controller and open the serial port immediately.
   * @param {string} portName
   * @return {SerialPort}
   */
  static openSerialPort(portName) {
    const SerialPortType = serialPortType();

    const port = new SerialPortType(portName, {
      baudRate: SERIAL_BAUD
    });

    this.createPendingQueue(port);
    return port;
  }

  /**
   * Create a serial port controller and open the Web Serial port immediately.
   * @param {string} portName
   * @return {Promise<SerialPort>}
   */
  static async openSerialPortWebSerial(port) {
    await port.open({baudRate: SERIAL_BAUD});

    this.createPendingQueue(port);
    return port;
  }

  // Creates a queue on the port to store pending buffers
  static createPendingQueue(port) {
    if (!isChromeOS()) {
      port.queue = [];
      let sendPending = false;
      const oldWrite = port.write;

      const trySend = buffer => {
        if (buffer) {
          port.queue.push(buffer);
        }

        if (sendPending || port.queue.length === 0) {
          // Exhausted pending send buffer.
          return;
        }
        if (port.queue.length > 512) {
          throw new Error(
            'Send queue is full! More than 512 pending messages.'
          );
        }

        const toSend = port.queue.shift();
        sendPending = true;
        oldWrite.call(port, toSend, 'binary', function() {
          sendPending = false;

          if (port.queue.length !== 0) {
            trySend();
          }
        });
      };

      port.write = (...args) => trySend(...args);
    }
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
