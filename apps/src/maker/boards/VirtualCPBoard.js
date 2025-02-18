/** @file For running Maker apps without an attached Circuit Playground board. */
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser
import _ from 'lodash';

import {
  J5_CONSTANTS,
  N_COLOR_LEDS,
} from './circuitPlayground/PlaygroundConstants';

/**
 * Virtual Circuit Playground Maker Board for running Maker Toolkit apps without a
 * Circuit Playground board attached.
 * Attaches virtual, no-op components to the interpreter.
 * @extends EventEmitter
 * @implements MakerBoard
 */
export default class VirtualCPBoard extends EventEmitter {
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
   * Marshals the board component controllers and appropriate constants into the
   * given JS Interpreter instance so they can be used by student code.
   *
   * @param {JSInterpreter} jsInterpreter
   */
  installOnInterpreter(jsInterpreter) {
    const constructors = {
      Led: VirtualLed,
      Board: VirtualComponent,
      NeoPixel: VirtualColorLed,
      PlaygroundButton: VirtualButton,
      Switch: VirtualToggleSwitch,
      Piezo: VirtualBuzzer,
      Sensor: VirtualSensor,
      Thermometer: VirtualThermometer,
      Pin: VirtualComponent,
      Accelerometer: VirtualAccelerometer,
      Animation: VirtualComponent,
      Servo: VirtualComponent,
      TouchSensor: VirtualComponent,
    };

    for (const constructorName in constructors) {
      const constructor = constructors[constructorName];
      jsInterpreter.addCustomMarshalObject({instance: constructor});
      jsInterpreter.createGlobalProperty(constructorName, constructor);
    }

    const components = {
      board: new VirtualComponent(),
      colorLeds: _.range(N_COLOR_LEDS).map(() => new VirtualColorLed()),
      led: new VirtualLed(),
      toggleSwitch: new VirtualToggleSwitch(),
      buzzer: new VirtualBuzzer(),
      soundSensor: new VirtualSensor(),
      lightSensor: new VirtualSensor(),
      tempSensor: new VirtualThermometer(),
      accelerometer: new VirtualAccelerometer(),
      buttonL: new VirtualButton(),
      buttonR: new VirtualButton(),
      ...J5_CONSTANTS,
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
    return new VirtualLed();
  }

  /**
   * @param {number} pin
   * @return {VirtualExternalButton}
   */
  createButton(pin) {
    return new VirtualButton();
  }
}

class VirtualComponent extends EventEmitter {}

class VirtualLed extends VirtualComponent {
  on() {}
  off() {}
  blink() {}
  toggle() {}
  pulse() {}
}

class VirtualColorLed extends VirtualLed {
  stop() {}
  intensity() {}
  color() {}
}

class VirtualBuzzer extends VirtualComponent {
  frequency() {}
  note() {}
  stop() {}
  play() {}
  playNotes() {}
  playSong() {}
}

class VirtualToggleSwitch extends VirtualComponent {
  constructor() {
    super();
    this.isOpen = false;
  }
}

class VirtualSensor extends VirtualComponent {
  constructor() {
    super();
    this.value = 0;
    this.threshold = 0;
  }

  start() {}
  setScale() {}
}

class VirtualThermometer extends VirtualComponent {
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

class VirtualButton extends VirtualComponent {
  constructor() {
    super();
    this.isPressed = false;
    this.holdtime = 0;
  }
}
