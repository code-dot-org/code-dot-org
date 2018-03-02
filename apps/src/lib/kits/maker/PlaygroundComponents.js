/**
 * Utilities for initializing Circuit Playground board components with APIs
 * conforming to Maker API droplet blocks.
 */

import {
  N_COLOR_LEDS,
  TOUCH_PINS,
  CP_COMMAND,
  CP_ACCEL_STREAM_ON
} from './PlaygroundConstants';
import LookbackLogger from './LookbackLogger';
import _ from 'lodash';
import five from '@code-dot-org/johnny-five';
import PlaygroundIO from 'playground-io';
import Button from './Button';
import Thermometer from './Thermometer';
import TouchSensor from './TouchSensor';
import Piezo from './Piezo';
import NeoPixel from './NeoPixel';
import Led from './Led';
import Switch from './Switch';
import experiments from '../../../util/experiments';

/**
 * Initializes a set of Johnny-Five component instances for the currently
 * connected Circuit Playground board.
 *
 * @param {five.Board} board - the johnny-five board object that needs new
 *        components initialized.
 * @returns {Promise.<Object.<String, Object>>} board components
 */
export function createCircuitPlaygroundComponents(board) {
  // Must initialize sound sensor BEFORE left button, otherwise left button
  // will not respond to input.  This has something to do with them sharing
  // pin 4 on the board.
  return Promise.all([
    initializeSoundSensor(board),
    initializeLightSensor(board),
    initializeThermometer(board),
  ]).then(([soundSensor, lightSensor, tempSensor]) => {
    return {
      colorLeds: initializeColorLeds(board),

      led: new Led({board, pin: 13}),

      toggleSwitch: new Switch(board),

      buzzer: new Piezo({
        board,
        pin: 5,
        controller: PlaygroundIO.Piezo
      }),

      soundSensor,

      lightSensor,

      tempSensor,

      accelerometer: initializeAccelerometer(board),

      buttonL: new Button({board, pin: 4}),

      buttonR: new Button({board, pin: 19}),

      ...(experiments.isEnabled('maker-captouch') && initializeTouchPads(board))
    };
  });
}

/**
 * De-initializes any Johnny-Five components that might have been created
 * by createCircuitPlaygroundComponents
 * @param {Object} components - map of components, as originally returned by
 *   createCircuitPlaygroundComponents.  This object will be mutated: Destroyed
 *   components will be removed. Additional members of this object will be
 *   ignored.
 */
export function destroyCircuitPlaygroundComponents(components) {
  if (components.colorLeds) {
    components.colorLeds.forEach(led => led.stop());
  }
  delete components.colorLeds;

  if (components.led) {
    components.led.stop();
  }
  delete components.led;

  // No reset needed for Switch
  delete components.toggleSwitch;

  if (components.buzzer) {
    components.buzzer.stop();
  }
  delete components.buzzer;

  if (components.soundSensor) {
    components.soundSensor.disable();
  }
  delete components.soundSensor;

  if (components.lightSensor) {
    components.lightSensor.disable();
  }
  delete components.lightSensor;

  if (components.tempSensor) {
    components.tempSensor.disable();
  }
  delete components.tempSensor;

  if (components.accelerometer) {
    components.accelerometer.stop();
  }
  delete components.accelerometer;

  // No reset needed for Button
  delete components.buttonL;
  delete components.buttonR;

  if (experiments.isEnabled('maker-captouch')) {
    // Remove listeners from each TouchSensor
    TOUCH_PINS.forEach(pin => {
      delete components[`touchPad${pin}`];
    });
  }
}

/**
 * Set of classes used by interpreter to understand the type of instantiated
 * objects, allowing it to make methods and properties of instances available.
 */
export const componentConstructors = {
  Led,
  Board: five.Board,
  NeoPixel,
  Button,
  Switch,
  Piezo,
  Sensor: five.Sensor,
  Thermometer: five.Thermometer,
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

function initializeColorLeds(board) {
  return _.range(N_COLOR_LEDS).map(i => initializeColorLed(board, i));
}

function initializeColorLed(board, pin) {
  return new NeoPixel({
    board,
    controller: PlaygroundIO.Pixel,
    pin
  });
}

function initializeSoundSensor(board) {
  return new Promise(resolve => {
    const sensor = new five.Sensor({
      board,
      pin: "A4",
      freq: 100
    });
    addSensorFeatures(five.Board.fmap, sensor);
    sensor.once('data', () => resolve(sensor));
  });
}

function initializeLightSensor(board) {
  return new Promise(resolve => {
    const sensor = new five.Sensor({
      board,
      pin: "A5",
      freq: 100
    });
    addSensorFeatures(five.Board.fmap, sensor);
    sensor.once('data', () => resolve(sensor));
  });
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

function initializeThermometer(board) {
  return new Promise(resolve => {
    const thermometer = new five.Thermometer({
      board,
      controller: Thermometer,
      pin: "A0",
      freq: 100
    });
    thermometer.once('data', () => resolve(thermometer));
  });
}

function initializeAccelerometer(board) {
  const accelerometer = new five.Accelerometer({
    board,
    controller: PlaygroundIO.Accelerometer
  });
  accelerometer.start = function () {
    accelerometer.io.sysexCommand([CP_COMMAND, CP_ACCEL_STREAM_ON]);
  };
  accelerometer.getOrientation = function (orientationType) {
    if (undefined === orientationType) {
      return [
        accelerometer.getOrientation('x'),
        accelerometer.getOrientation('y'),
        accelerometer.getOrientation('z')
      ];
    }
    return accelerometer[orientationType];
  };
  accelerometer.getAcceleration = function (accelerationDirection) {
    if (undefined === accelerationDirection) {
      return [
        accelerometer.getAcceleration('x'),
        accelerometer.getAcceleration('y'),
        accelerometer.getAcceleration('z')
      ];
    }
    if (accelerationDirection === 'total') {
      return accelerometer.acceleration;
    }
    return accelerometer[accelerationDirection];
  };
  return accelerometer;
}

function initializeTouchPads(board) {
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
