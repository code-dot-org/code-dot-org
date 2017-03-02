/**
 * Utilities for initializing Circuit Playground board components with APIs
 * conforming to Maker API droplet blocks.
 */

import {N_COLOR_LEDS , TOUCH_PINS} from './PlaygroundConstants';
import LookbackLogger from './LookbackLogger';
import _ from 'lodash';
import five from 'johnny-five';
import PlaygroundIO from 'playground-io';
import Thermometer from './Thermometer';
import TouchSensor from './TouchSensor';
import Piezo from './Piezo';

/**
 * Initializes a set of Johnny-Five component instances for the currently
 * connected Circuit Playground board.
 *
 * @param {five.Board} board - the johnny-five board object that needs new
 *        components initialized.
 * @returns {Object.<String, Object>} board components
 */
export function initializeCircuitPlaygroundComponents(board) {
  return {
    colorLeds: initializeColorLeds(board),

    led: new five.Led({board, pin: 13}),

    toggleSwitch: new five.Switch({board, pin: '21'}),

    buzzer: new Piezo({
      board,
      pin: '5',
      controller: PlaygroundIO.Piezo
    }),

    // Must initialize sound sensor BEFORE left button, otherwise left button
    // will not respond to input.  This has something to do with them sharing
    // pin 4 on the board.
    soundSensor: initializeSoundSensor(board),

    tempSensor: initializeThermometer(board),

    lightSensor: initializeLightSensor(board),

    accelerometer: initializeAccelerometer(board),

    buttonL: initializeButton(board, '4'),

    buttonR: initializeButton(board, '19'),

    ...initializeTouchPads(board)
  };
}

/**
 * De-initializes any Johnny-Five components that might have been created
 * by initializeCircuitPlaygroundComponents
 * @param {Object} components - map of components, as originally returned by
 *   initializeCircuitPlaygroundComponents.  Additional members of this object
 *   will be ignored.
 */
export function deinitializeCircuitPlaygroundComponents(components) {
  if (components.colorLeds) {
    components.colorLeds.forEach(led => led.stop());
  }

  if (components.led) {
    components.led.stop();
  }

  // No reset needed for five.Switch

  if (components.buzzer) {
    components.buzzer.stop();
  }

  if (components.soundSensor) {
    components.soundSensor.disable();
  }

  // TODO: tempSensor: initializeThermometer(board),

  if (components.lightSensor) {
    components.lightSensor.disable();
  }

  // TODO: accelerometer: initializeAccelerometer(board),
  // TODO: buttonL: initializeButton(board, '4'),
  // TODO: buttonR: initializeButton(board, '19'),
  // TODO: initializeTouchPads(board)
}

/**
 * Set of classes used by interpreter to understand the type of instantiated
 * objects, allowing it to make methods and properties of instances available.
 */
export const componentConstructors = {
  Led: five.Led,
  Board: five.Board,
  RGB: five.Led.RGB,
  Button: five.Button,
  Switch: five.Switch,
  Piezo,
  Thermometer: five.Thermometer,
  Sensor: five.Sensor,
  Pin: five.Pin,
  Accelerometer: five.Accelerometer,
  Animation: five.Animation,
  /**
   * @link https://en.wikipedia.org/wiki/Three_Laws_of_Robotics
   * 1. A robot may not injure a human being or, through inaction, allow a human being to come to harm.
   * 2. A robot must obey orders given it by human beings except where such orders would conflict with the First Law.
   * 3. A robot must protect its own existence as long as such protection does not conflict with the First or Second Law.
   */
  Servo: five.Servo,
  TouchSensor
};

export function initializeColorLeds(board) {
  return _.range(N_COLOR_LEDS).map(i => initializeColorLed(board, i));
}

function initializeColorLed(board, pin) {
  return new five.Led.RGB({
    board,
    controller: PlaygroundIO.Pixel,
    pin
  });
}

export function initializeSoundSensor(board) {
  const sensor = new five.Sensor({
    board,
    pin: "A4",
    freq: 100
  });
  addSensorFeatures(five.Board.fmap, sensor);
  return sensor;
}

export function initializeLightSensor(board) {
  const sensor = new five.Sensor({
    board,
    pin: "A5",
    freq: 100
  });
  addSensorFeatures(five.Board.fmap, sensor);
  return sensor;
}

export function initializeThermometer(board) {
  const sensor = new five.Thermometer({
    board,
    controller: Thermometer,
    pin: "A0",
    freq: 100
  });
  addSensorFeatures(five.Board.fmap, sensor);
  return sensor;
}

/**
 * Adds `getAveragedValue` using LookbackLogger to a five.Sensor instance.
 * @param {five.Board.fmap} fmap mapping function
 * @param {five.Sensor} sensor
 */
function addSensorFeatures(fmap, sensor) {
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
}

export function initializeButton(board, pin) {
  const button = new five.Button({board, pin});
  Object.defineProperty(button, 'isPressed', {
    get: () => button.value === 1
  });
  return button;
}

export function initializeAccelerometer(board) {
  const accelerometer = new five.Accelerometer({
    board,
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
  return accelerometer;
}

export function initializeTouchPads(board) {
  // We make one playground-io Touchpad component for all captouch sensors,
  // then wrap it in our own separate objects to get the API we want to
  // expose to students.
  const playgroundTouchpad = new five.Touchpad({
    board,
    controller: PlaygroundIO.Touchpad,
    pads: TOUCH_PINS
  });
  let touchPads = {};
  TOUCH_PINS.forEach(pin => {
    touchPads[`touchPad${pin}`] = new TouchSensor(pin, playgroundTouchpad);
  });
  return touchPads;
}
