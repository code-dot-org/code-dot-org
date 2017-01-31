/**
 * Utilities for initializing Circuit Playground board components with APIs
 * conforming to Maker API droplet blocks.
 */

import {N_COLOR_LEDS , TOUCH_PINS} from './PlaygroundConstants';
import LookbackLogger from './LookbackLogger';
import _ from 'lodash';
import five from 'johnny-five';
import PlaygroundIO from 'playground-io';

/**
 * Initializes a set of Johnny-Five component instances for the currently
 * connected Circuit Playground board.
 *
 * Components:
 *   - will each have .stop() called on Reset
 *
 * @returns {Object.<String, Object>} board components
 */
export function initializeCircuitPlaygroundComponents() {
  const colorLeds = _.range(N_COLOR_LEDS).map(index => new five.Led.RGB({
    controller: PlaygroundIO.Pixel,
    pin: index
  }));

  // Must initialize sound sensor BEFORE left button, otherwise left button
  // will not respond to input.
  const soundSensor = new five.Sensor({
    pin: "A4",
    freq: 100
  });
  const buttonL = new five.Button('4');
  const buttonR = new five.Button('19');
  [buttonL, buttonR].forEach(button => {
    Object.defineProperty(button, 'isPressed', {
      get: () => button.value === 1
    });
  });

  const accelerometer = new five.Accelerometer({
    controller: PlaygroundIO.Accelerometer
  });
  accelerometer.getOrientation = function (orientationType) {
    return accelerometer[orientationType];
  };
  accelerometer.getAcceleration = function (accelerationDirection) {
    if (accelerationDirection === 'total') {
      return accelerometer.acceleration;
    }
    return accelerometer[accelerationDirection];
  };

  const touchpad = new five.Touchpad({
    controller: PlaygroundIO.Touchpad,
    pads: TOUCH_PINS
  });

  const lightSensor = new five.Sensor({
    pin: "A5",
    freq: 100
  });
  const tempSensor = new five.Thermometer({
    controller: "TINKERKIT",
    pin: "A0",
    freq: 100
  });

  [soundSensor, lightSensor, tempSensor].forEach((s) => {
    addSensorFeatures(five.Board.fmap, s);
  });

  return {
    colorLeds: colorLeds,

    led: new five.Led(13),

    toggleSwitch: new five.Switch('21'),

    buzzer: new five.Piezo({
      pin: '5',
      controller: PlaygroundIO.Piezo
    }),

    tempSensor: tempSensor,

    lightSensor: lightSensor,

    accelerometer: accelerometer,

    touchpad: touchpad,

    soundSensor: soundSensor,

    buttonL: buttonL,

    buttonR: buttonR,
  };
}

/**
 * Adds `getAveragedValue` using LookbackLogger to a five.Sensor instance.
 * @param {five.Board.fmap} fmap mapping function
 * @param {five.Sensor} sensor
 */
const addSensorFeatures = (fmap, sensor) => {
  /**
   * Cache scale setting locally (cannot grab after the fact from five.Sensor).
   * Scale is a 2-element array of [low, high].
   * @type {Array.<number>|undefined}
   */
  let scale = undefined;

  sensor.lookbackLogger = new LookbackLogger();
  sensor.start = () => {
    sensor.on('data', () => {
      // Add the raw (un-scaled) value to the logger.
      sensor.lookbackLogger.addData(sensor.raw);
    });
  };
  sensor.getAveragedValue = (n) => {
    const [low, high] = scale || [0, 1023];
    return fmap(sensor.lookbackLogger.getLast(n), 0, 1023, low, high);
  };

  // Set scale for setScale block, which records for later use.
  sensor.setScale = (low, high) => {
    sensor.scale(low, high);
    // store scale in public state for scaling recorded data
    scale = [low, high];
  };
};
