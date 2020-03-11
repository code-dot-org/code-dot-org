/**
 * Utilities for initializing MicroBit board components
 */
import {MicroBitButton} from './Button';
import LedMatrix from './LedMatrix';
import Accelerometer from './Accelerometer';
import {MicroBitThermometer} from './Thermometer';

/**
 * Initializes a set of components for the currently
 * connected MicroBit board.
 *
 * @param {MBFirmataClient} board - Microbit firmata client
 * @returns {Promise} board components
 */
export function createMicroBitComponents(board) {
  return Promise.resolve({
    buttonA: new MicroBitButton({mb: board, pin: 1}),
    buttonB: new MicroBitButton({mb: board, pin: 2}),
    ledMatrix: new LedMatrix({mb: board}),
    tempSensor: new MicroBitThermometer({mb: board}),
    accelerometer: new Accelerometer({mb: board})
  });
}

/**
 * De-initializes any components that might have been created
 * by createMicroBitComponents
 * @param {Object} components - map of components, as originally returned by
 *   createMicroBitComponents.  This object will be mutated: Destroyed
 *   components will be removed. Additional members of this object will be
 *   ignored.
 * @param {boolean} shouldDestroyComponents - whether or not to fully delete the
 *   components, or just reset to their initial state.
 */
export function cleanupMicroBitComponents(components, shouldDestroyComponents) {
  if (components.ledMatrix) {
    components.ledMatrix.allOff();
  }

  if (components.tempSensor) {
    components.tempSensor.stop();
    components.tempSensor.currentTemp = 0;
  }

  if (components.accelerometer) {
    components.accelerometer.state = {x: 0, y: 0, z: 0};
    components.accelerometer.stop();
  }

  if (shouldDestroyComponents) {
    delete components.ledMatrix;
    delete components.buttonA;
    delete components.buttonB;
    delete components.accelerometer;
    delete components.tempSensor;
  }
}

/**
 * Re-initializes accelerometer
 * @param {Object} components - map of components, as originally returned by
 *   createMicroBitComponents.
 */
export function enableMicroBitComponents(components) {
  if (components.accelerometer) {
    components.accelerometer.start();
  }

  if (components.tempSensor) {
    components.tempSensor.start();
  }
}

/**
 * Set of classes used by interpreter to understand the type of instantiated
 * objects, allowing it to make methods and properties of instances available.
 */
export const componentConstructors = {
  MicroBitButton,
  LedMatrix,
  Accelerometer,
  MicroBitThermometer
};
