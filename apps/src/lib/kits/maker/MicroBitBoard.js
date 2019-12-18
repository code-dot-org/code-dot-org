/** @file Board controller for BBC micro:bit */
/* global SerialPort */ // Maybe provided by the Code.org Browser
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser
import MBFirmataClient from '../../../third-party/maker/MBFirmataClient';
import {
  createMicroBitComponents,
  componentConstructors
} from './MicroBitComponents';

/**
 * Controller interface for BBC micro:bit board using
 * micro:bit Firmata firmware.
 * @extends EventEmitter
 * @implements MakerBoard
 */
export default class MicroBitBoard extends EventEmitter {
  constructor() {
    super();

    /** @private {Object} Map of component controllers */
    this.prewiredComponents_ = null;

    /** @private {MicrobitFirmataClient} serial port controller */
    this.boardClient_ = new MBFirmataClient(SerialPort);
  }

  /**
   * Open a connection to the board on its configured port.
   * @return {Promise}
   */
  connect() {
    return Promise.resolve()
      .then(() => this.boardClient_.connect())
      .then(() => this.initializeComponents());
  }

  /**
   * Initialize a set of component controllers.
   * Exposed as a separate step here for the sake of the setup page; generally
   * it'd be better to just call connect(), above.
   * @throws {Error} if called before connecting to firmware
   */
  initializeComponents() {
    return createMicroBitComponents(this.boardClient_).then(components => {
      this.prewiredComponents_ = {
        board: this.boardClient_,
        ...components
      };
    });
  }

  initializeEventForwarding() {}

  /**
   * @returns {boolean} whether a real board is currently connected or not.
   */
  boardConnected() {
    return !!this.boardClient_.myPort;
  }

  // TODO
  pinMode(pin, modeConstant) {}

  // TODO
  digitalWrite(pin, value) {}

  // TODO
  digitalRead(pin, callback) {}

  // TODO
  analogWrite(pin, value) {}

  // TODO
  analogRead(pin, callback) {}

  // TODO
  createLed(pin) {}

  // TODO
  createButton(pin) {}

  // TODO
  /**
   * Disconnect and clean up the board controller and all components.
   */
  destroy() {}

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
}
