/** @file For running Maker apps without an attached MicroBit board. */
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser
import {MBFirmataClientStub} from '../util/makeStubBoard';

/**
 * Virtual MicroBit Board for running Maker Toolkit apps without a MicroBit board
 * attached.
 * Attaches virtual, no-op components to the interpreter.
 * @extends EventEmitter
 * @implements MakerBoard
 */
export default class VirtualMBBoard extends EventEmitter {
  constructor() {
    super();
    this.boardClient_ = new MBFirmataClientStub();
  }

  /**
   * Open a connection to the board on its configured port.
   * @returns {Promise} resolved when the board is ready to use.
   */
  connect() {
    return Promise.resolve();
  }

  /**
   * Disconnect and clean up the board controller and all components.
   * @returns {Promise}
   */
  destroy() {
    return Promise.resolve();
  }

  reset() {}

  /**
   * Create a serial port controller and open the serial port immediately.
   * @return {Serial}
   */
  openWebSerial() {}

  /**
   * Marshals the board component controllers and appropriate constants into the
   * given JS Interpreter instance so they can be used by student code.
   *
   * @param {JSInterpreter} jsInterpreter
   */
  installOnInterpreter(jsInterpreter) {
    const constructors = {
      MicroBitButton: VirtualMicroBitButton,
      LedScreen: VirtualLedScreen,
      Accelerometer: VirtualAccelerometer,
      MicroBitThermometer: VirtualMicroBitThermometer,
      Compass: VirtualCompass,
      LightSensor: VirtualLightSensor,
      ExternalButton: VirtualExternalButton,
      ExternalLed: VirtualExternalLed,
      CapacitiveTouchSensor: VirtualCapacitiveTouchSensor,
    };

    for (const constructorName in constructors) {
      const constructor = constructors[constructorName];
      jsInterpreter.addCustomMarshalObject({instance: constructor});
      jsInterpreter.createGlobalProperty(constructorName, constructor);
    }

    const components = {
      buttonA: new VirtualMicroBitButton(),
      buttonB: new VirtualMicroBitButton(),
      ledScreen: new VirtualLedScreen(),
      tempSensor: new VirtualMicroBitThermometer(),
      accelerometer: new VirtualAccelerometer(),
      lightSensor: new VirtualLightSensor(),
      compass: new VirtualCompass(),
      board: new VirtualMBFirmataWrapper(),
    };

    for (const componentName in components) {
      const component = components[componentName];
      jsInterpreter.createGlobalProperty(componentName, component);
    }
  }

  /**
   * @param {number} pin
   * @param {number} modeConstant
   */
  pinMode(pin, modeConstant) {}

  /**
   * @param {number} pin
   * @param {number} value
   */
  digitalWrite(pin, value) {}

  /**
   * @param {number} pin
   * @param {function.<number>} callback
   */
  digitalRead(pin, callback) {
    setTimeout(() => callback(0), 0);
  }

  /**
   * @param {number} pin
   * @param {number} value
   */
  analogWrite(pin, value) {}

  /**
   * @param {number} pin
   * @param {function.<number>} callback
   */
  analogRead(pin, callback) {
    setTimeout(() => callback(0), 0);
  }

  /**
   * @return {boolean} whether a real board is connected
   */
  boardConnected() {
    return false;
  }

  /**
   * @param {number} pin
   * @return {VirtualExternalLed}
   */
  createLed(pin) {
    return new VirtualExternalLed();
  }

  /**
   * @param {number} pin
   * @return {VirtualExternalButton}
   */
  createButton(pin) {
    return new VirtualExternalButton();
  }

  /**
   * @return {VirtualExternalButton}
   */
  createCapacitiveTouchSensor() {
    return new VirtualCapacitiveTouchSensor();
  }
}

class VirtualComponent extends EventEmitter {}

class VirtualLedScreen extends VirtualComponent {
  on() {}
  off() {}
  toggle() {}
  clear() {}
  display() {}
  scrollNumber() {}
  scrollString() {}
}

class VirtualLightSensor extends VirtualComponent {
  constructor() {
    super();
    this.value = 0;
    this.threshold = 0;
  }

  start() {}
  setScale() {}

  getAveragedValue() {
    return 0;
  }
}

class VirtualMicroBitThermometer extends VirtualComponent {
  constructor() {
    super();
    this.F = 32;
    this.C = 0;
  }
}

class VirtualAccelerometer extends VirtualComponent {
  start() {}
  getAcceleration() {
    return 0;
  }

  getOrientation() {
    return 0;
  }
}

class VirtualMicroBitButton extends VirtualComponent {
  constructor() {
    super();
    this.isPressed = false;
    this.holdtime = 0;
  }
}

class VirtualCompass extends VirtualComponent {
  start() {}
  getHeading() {}
}

class VirtualExternalLed extends VirtualComponent {
  on() {}
  off() {}
  blink() {}
  toggle() {}
  pulse() {}
}

class VirtualExternalButton extends VirtualMicroBitButton {}

class VirtualCapacitiveTouchSensor extends VirtualComponent {
  constructor() {
    super();
    this.isPressed = false;
  }
}

class VirtualMBFirmataWrapper {}
