/** @file Fake Maker Board for running Maker apps without a board attached. */
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser
import {J5_CONSTANTS} from './PlaygroundConstants';

/**
 * Fake Maker Board for running Maker Toolkit apps without a board attached.
 * Attaches fake, no-op components to the interpreter.
 * @extends EventEmitter
 * @implements MakerBoard
 */
export default class FakeBoard extends EventEmitter {

  /**
   * Open a connection to the board on its configured port.
   * @returns {Promise} resolved when the board is ready to use.
   */
  connect() {
    return Promise.resolve();
  }

  /**
   * Disconnect and clean up the board controller and all components.
   */
  destroy() {
    // Included for compatability with MakerBoard interface
  }

  /**
   * Marshals the board component controllers and appropriate constants into the
   * given JS Interpreter instance so they can be used by student code.
   *
   * @param {JSInterpreter} jsInterpreter
   */
  installOnInterpreter(jsInterpreter) {
    [
      'Led',
      'Board',
      'RGB',
      'Button',
      'Switch',
      'Piezo',
      'Sensor',
      'Thermometer',
      'Pin',
      'Accelerometer',
      'Animation',
      'Servo',
      'TouchSensor',
    ].forEach(constructorName => {
      const constructor = function () {};
      jsInterpreter.addCustomMarshalObject({instance: constructor});
      jsInterpreter.createGlobalProperty(constructorName, constructor);
    });

    const components = {
      board: {},
      colorLeds: {},
      led: {},
      toggleSwitch: {},
      buzzer: {},
      soundSensor: {},
      lightSensor: {},
      tempSensor: {},
      accelerometer: {},
      buttonL: {},
      buttonR: {},
      ...J5_CONSTANTS,
    };

    Object.keys(components).forEach(componentName => {
      jsInterpreter.createGlobalProperty(componentName, components[componentName]);
    });
  }

  /**
   * @param {number} pin
   * @param {number} modeConstant
   */
  pinMode(pin, modeConstant) {
  }

  /**
   * @param {number} pin
   * @param {number} value
   */
  digitalWrite(pin, value) {
  }

  /**
   * @param {number} pin
   * @param {function.<number>} callback
   */
  digitalRead(pin, callback) {
  }

  /**
   * @param {number} pin
   * @param {number} value
   */
  analogWrite(pin, value) {
  }

  /**
   * @param {number} pin
   * @param {function.<number>} callback
   */
  analogRead(pin, callback) {
  }
}
