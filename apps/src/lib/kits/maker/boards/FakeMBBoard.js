/** @file Fake for running Maker apps without an attached MicroBit board. */
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser
import {MBFirmataClientStub} from '../../../../../test/unit/lib/kits/maker/boards/makeStubBoard';

/**
 * Fake MicroBit Board for running Maker Toolkit apps without a MicroBit board
 * attached.
 * Attaches fake, no-op components to the interpreter.
 * @extends EventEmitter
 * @implements MakerBoard
 */
export default class FakeMBBoard extends EventEmitter {
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

  openSerialPort() {}

  /**
   * Marshals the board component controllers and appropriate constants into the
   * given JS Interpreter instance so they can be used by student code.
   *
   * @param {JSInterpreter} jsInterpreter
   */
  installOnInterpreter(jsInterpreter) {
    const constructors = {
      MicroBitButton: FakeMicroBitButton,
      LedScreen: FakeLedScreen,
      Accelerometer: FakeAccelerometer,
      MicroBitThermometer: FakeMicroBitThermometer,
      Compass: FakeCompass,
      LightSensor: FakeLightSensor,
      ExternalButton: FakeExternalButton,
      ExternalLed: FakeExternalLed,
      CapacitiveTouchSensor: FakeCapacitiveTouchSensor
    };

    for (const constructorName in constructors) {
      const constructor = constructors[constructorName];
      jsInterpreter.addCustomMarshalObject({instance: constructor});
      jsInterpreter.createGlobalProperty(constructorName, constructor);
    }

    const components = {
      buttonA: new FakeMicroBitButton(),
      buttonB: new FakeMicroBitButton(),
      ledScreen: new FakeLedScreen(),
      tempSensor: new FakeMicroBitThermometer(),
      accelerometer: new FakeAccelerometer(),
      lightSensor: new FakeLightSensor(),
      compass: new FakeCompass(),
      board: new FakeMBFirmataWrapper()
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

  createLed(pin) {
    return new FakeExternalLed();
  }

  createButton(pin) {
    return new FakeExternalButton();
  }
}

class FakeComponent extends EventEmitter {}

class FakeLedScreen extends FakeComponent {
  on() {}
  off() {}
  toggle() {}
  clear() {}
  display() {}
  scrollNumber() {}
  scrollString() {}
}

class FakeLightSensor extends FakeComponent {
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

class FakeMicroBitThermometer extends FakeComponent {
  constructor() {
    super();
    this.F = 32;
    this.C = 0;
  }
}

class FakeAccelerometer extends FakeComponent {
  start() {}
  getAcceleration() {
    return 0;
  }

  getOrientation() {
    return 0;
  }
}

class FakeMicroBitButton extends FakeComponent {
  constructor() {
    super();
    this.isPressed = false;
    this.holdtime = 0;
  }
}

class FakeCompass extends FakeComponent {
  start() {}
  getHeading() {}
}

class FakeExternalLed extends FakeComponent {
  on() {}
  off() {}
  blink() {}
  toggle() {}
  pulse() {}
}

class FakeExternalButton extends FakeMicroBitButton {}

class FakeCapacitiveTouchSensor extends FakeComponent {}

class FakeMBFirmataWrapper {}
