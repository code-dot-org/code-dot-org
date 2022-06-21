/** @file Board controller for BBC micro:bit */
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser
import {
  createMicroBitComponents,
  cleanupMicroBitComponents,
  enableMicroBitComponents,
  componentConstructors
} from './MicroBitComponents';
import MBFirmataWrapper from './MBFirmataWrapper';
import ExternalLed from './ExternalLed';
import ExternalButton from './ExternalButton';
import CapacitiveTouchSensor from './CapacitiveTouchSensor';
import {isChromeOS, serialPortType} from '../../util/browserChecks';

/**
 * Controller interface for BBC micro:bit board using
 * micro:bit Firmata firmware.
 * @extends EventEmitter
 * @implements MakerBoard
 */
export default class MicroBitBoard extends EventEmitter {
  constructor(port) {
    super();

    this.port = port;

    /** @private {Object} Map of component controllers */
    this.prewiredComponents_ = null;

    this.chromeOS = isChromeOS();

    let portType = serialPortType(true);

    /** @private {MicrobitFirmataClient} serial port controller */
    this.boardClient_ = new MBFirmataWrapper(portType);

    /** @private {Array} List of dynamically-created component controllers. */
    this.dynamicComponents_ = [];

    this.interpreterReference_ = null;
  }

  /**
   * Open a connection to the board on its configured port.
   * @return {Promise}
   */
  connect() {
    return Promise.resolve()
      .then(() => this.checkExpectedFirmware())
      .then(() => this.initializeComponents());
  }

  /**
   * Create a serial port controller and open the serial port immediately.
   * @return {SerialPort}
   */
  openSerialPort() {
    const portName = this.port ? this.port.comName : undefined;
    const SerialPortType = serialPortType(false);

    /** @const {number} serial port transfer rate */
    const SERIAL_BAUD = 57600;

    let serialPort;
    if (!this.chromeOS) {
      serialPort = new SerialPortType(portName, {baudRate: SERIAL_BAUD});
      return Promise.resolve(serialPort);
    } else {
      // Chrome-serialport uses callback to relay when serialport initialization is complete.
      // Wrapping construction function to call promise resolution as callback.
      let constructorFunction = callback => {
        serialPort = new SerialPortType(
          portName,
          {
            baudRate: SERIAL_BAUD
          },
          true,
          callback
        );
      };
      return new Promise(resolve => constructorFunction(resolve)).then(() =>
        Promise.resolve(serialPort)
      );
    }
  }

  /**
   * Connect to the micro:bit firmata client. After connecting, check the firmata
   * version and firmware version response on the boardClient. If not connected
   * or a different firmware version discovered, reject. Otherwise, resolve.
   * Exposed as a separate step here for the sake of the setup page; generally
   * recommended to just call connect(), above.
   * @returns {Promise<void>}
   */
  checkExpectedFirmware() {
    return Promise.resolve()
      .then(() => this.openSerialPort())
      .then(serialPort => this.boardClient_.connectBoard(serialPort))
      .catch(err => Promise.reject(err));
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

  /**
   * Enable existing board components
   */
  enableComponents() {
    if (this.prewiredComponents_) {
      enableMicroBitComponents(this.prewiredComponents_);
    }
  }

  /**
   * @returns {boolean} whether a real board is currently connected or not.
   */
  boardConnected() {
    return !!this.boardClient_.myPort;
  }

  pinMode(pin, modeConstant) {
    this.boardClient_.setPinMode(pin, modeConstant);
  }

  digitalWrite(pin, value) {
    this.boardClient_.digitalWrite(pin, value);
  }

  digitalRead(pin, callback) {
    this.boardClient_.digitalRead(pin, callback);
  }

  analogWrite(pin, value) {
    this.boardClient_.analogWrite(pin, value);
  }

  analogRead(pin, callback) {
    this.boardClient_.analogRead(pin, callback);
  }

  createLed(pin) {
    const newLed = new ExternalLed({board: this.boardClient_, pin});
    this.dynamicComponents_.push(newLed);
    return newLed;
  }

  createButton(pin) {
    const newButton = new ExternalButton({mb: this.boardClient_, pin});
    this.dynamicComponents_.push(newButton);
    return newButton;
  }

  createCapacitiveTouchSensor(pin) {
    const newSensor = new CapacitiveTouchSensor({mb: this.boardClient_, pin});
    // Add the capacitive touch sensor to the interpreter
    // The interpreter reference is set during the board connection so
    // should be not-null here
    if (this.interpreterReference_) {
      this.interpreterReference_.addCustomMarshalObject({
        instance: CapacitiveTouchSensor
      });
      this.interpreterReference_.createGlobalProperty(
        'CapacitiveTouchSensor',
        CapacitiveTouchSensor
      );
    }

    this.dynamicComponents_.push(newSensor);
    return newSensor;
  }

  /**
   * Disconnect and clean up the board controller and all components.
   */
  destroy() {
    this.dynamicComponents_.forEach(component => {
      // For now, these are _always_ Leds.  Complain if they're not.
      if (component instanceof ExternalLed) {
        component.off();
      } else if (component instanceof ExternalButton) {
        // No special cleanup required for button
      } else {
        throw new Error('Added an unsupported component to dynamic components');
      }
    });
    this.dynamicComponents_.length = 0;

    if (this.prewiredComponents_) {
      cleanupMicroBitComponents(
        this.prewiredComponents_,
        this.dynamicComponents_,
        true /* shouldDestroyComponents */
      );
    }
    this.prewiredComponents_ = null;

    if (this.boardClient_) {
      this.boardClient_.disconnect();
      this.boardClient_.reset();
    }
    this.boardClient_ = null;

    return Promise.resolve();
  }

  /**
   * Marshals the board component controllers and appropriate constants into the
   * given JS Interpreter instance so they can be used by student code.
   * @param {JSInterpreter} jsInterpreter
   */
  installOnInterpreter(jsInterpreter) {
    this.interpreterReference_ = jsInterpreter;
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
    cleanupMicroBitComponents(
      this.prewiredComponents_,
      this.dynamicComponents_,
      false /* shouldDestroyComponents */
    );
  }
}
