/**
 * Utilities for initializing MicroBit board components
 */
import Accelerometer from './Accelerometer';
import CapacitiveTouchSensor from './CapacitiveTouchSensor';
import Compass from './Compass';
import ExternalButton from './ExternalButton';
import ExternalLed from './ExternalLed';
import LedScreen from './LedScreen';
import LightSensor from './LightSensor';
import MicroBitButton from './MicroBitButton';
import MicroBitThermometer from './MicroBitThermometer';

/**
 * Initializes a set of components for the currently
 * connected MicroBit board.
 *
 * @param {MBFirmataClient} boardClient - Microbit firmata client
 * @returns {Promise} board components
 */
export function createMicroBitComponents(boardClient) {
  return Promise.resolve({
    buttonA: new MicroBitButton({mb: boardClient, pin: 1}),
    buttonB: new MicroBitButton({mb: boardClient, pin: 2}),
    ledScreen: new LedScreen({mb: boardClient}),
    tempSensor: new MicroBitThermometer({mb: boardClient}),
    accelerometer: new Accelerometer({mb: boardClient}),
    compass: new Compass({mb: boardClient}),
    lightSensor: new LightSensor({mb: boardClient}),
  });
}

/**
 * De-initializes any components that might have been created
 * by createMicroBitComponents
 * @param {Object} components - map of components, as originally returned by
 *   createMicroBitComponents.  This object will be mutated: Destroyed
 *   components will be removed. Additional members of this object will be
 *   ignored.
 * @param {Object} dynamicComponents - dynamic components, from MicroBitBoard
 * @param {boolean} shouldDestroyComponents - whether or not to fully delete the
 *   components, or just reset to their initial state.
 */
export function cleanupMicroBitComponents(
  components,
  dynamicComponents,
  shouldDestroyComponents
) {
  if (components.ledScreen) {
    components.ledScreen.clear();
  }

  if (components.tempSensor) {
    components.tempSensor.stop();
    components.tempSensor.currentTemp = 0;
  }

  if (components.accelerometer) {
    components.accelerometer.state = {x: 0, y: 0, z: 0};
    components.accelerometer.stop();
  }

  if (components.compass) {
    components.compass.state = {x: 0, y: 0};
    components.compass.stop();
  }

  if (components.lightSensor) {
    components.lightSensor.stop();
    components.lightSensor.reset();
  }

  dynamicComponents.forEach(component => {
    if (component instanceof CapacitiveTouchSensor) {
      component.stop();
      component.connected = false;
    }
  });

  if (shouldDestroyComponents) {
    delete components.ledScreen;
    delete components.buttonA;
    delete components.buttonB;
    delete components.accelerometer;
    delete components.tempSensor;
    delete components.compass;
    delete components.lightSensor;
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

  if (components.compass) {
    components.compass.start();
  }

  if (components.lightSensor) {
    components.lightSensor.start();
  }
}

/**
 * Set of classes used by interpreter to understand the type of instantiated
 * objects, allowing it to make methods and properties of instances available.
 */
export const componentConstructors = {
  MicroBitButton,
  LedScreen,
  Accelerometer,
  MicroBitThermometer,
  Compass,
  LightSensor,
  ExternalButton,
  ExternalLed,
  CapacitiveTouchSensor,
};
