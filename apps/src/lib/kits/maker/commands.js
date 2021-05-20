/** @file Maker commands (invoked by Applab/Gamelab.executeCmd) */
import {
  apiValidateType,
  apiValidateTypeAndRange
} from '../../util/javascriptMode';
import {BOARD_EVENT_ALIASES} from './boards/circuitPlayground/PlaygroundConstants';
import MicroBitBoard from './boards/microBit/MicroBitBoard';

/** @private {CircuitPlaygroundBoard} */
let board;

/**
 * Change which board controller handles Maker Toolkit commands.
 * @param {CircuitPlaygroundBoard} boardController
 */
export function injectBoardController(boardController) {
  board = boardController;
}

/**
 * @param {string|number} opts.pin
 * @param {string} opts.mode
 */
export function pinMode(opts) {
  apiValidateType(opts, 'pinMode', 'pin', opts.pin, 'pinid');
  apiValidateType(opts, 'pinMode', 'mode', opts.mode, 'string');

  const modeStringToConstant = {
    input: 0,
    output: 1,
    analog: 2,
    pwm: 3,
    servo: 4
  };

  board.pinMode(opts.pin, modeStringToConstant[opts.mode]);
}

/**
 * @param {string|number} opts.pin
 * @param {number} opts.value
 */
export function digitalWrite(opts) {
  apiValidateType(opts, 'digitalWrite', 'pin', opts.pin, 'pinid');
  apiValidateTypeAndRange(
    opts,
    'digitalWrite',
    'value',
    opts.value,
    'number',
    0,
    1
  );

  board.digitalWrite(opts.pin, opts.value);
}

/**
 * @param {string|number} opts.pin
 */
export function digitalRead(opts) {
  apiValidateType(opts, 'digitalRead', 'pin', opts.pin, 'pinid');

  return board.digitalRead(opts.pin, opts.callback);
}

/**
 * @param {string|number} opts.pin
 * @param {number} opts.value
 */
export function analogWrite(opts) {
  apiValidateType(opts, 'analogWrite', 'pin', opts.pin, 'pinid');
  apiValidateTypeAndRange(
    opts,
    'analogWrite',
    'value',
    opts.value,
    'number',
    0,
    255
  );

  board.analogWrite(opts.pin, opts.value);
}

/**
 * @param {string|number} opts.pin
 */
export function analogRead(opts) {
  apiValidateType(opts, 'analogRead', 'pin', opts.pin, 'pinid');

  return board.analogRead(opts.pin, opts.callback);
}

/**
 * @returns {boolean} Whether a real board is connected at the moment.
 */
export function boardConnected() {
  return board.boardConnected();
}

/**
 * Add a handler for a maker board event from a particular board component.
 * @param {Object} opts.component
 * @param {string} opts.event
 * @param {function} opts.callback
 */
export function onBoardEvent(opts) {
  let {component, event, callback} = opts;
  // Look up aliases for CircuitPlaygroundBoard
  if (BOARD_EVENT_ALIASES[event] && !(board instanceof MicroBitBoard)) {
    event = BOARD_EVENT_ALIASES[event];
  }
  component.on(event, callback);
}

/**
 * Create an LED component on the current maker board attached to the
 * specified pin.
 * @param {number} opts.pin
 */
export function createLed(opts) {
  apiValidateType(opts, 'createLed', 'pin', opts.pin, 'pinid');
  return board.createLed(opts.pin);
}

/**
 * Create a Button component on the current maker board attached to the
 * specified pin.
 * @param {number} opts.pin
 */
export function createButton(opts) {
  apiValidateType(opts, 'createButton', 'pin', opts.pin, 'pinid');
  return board.createButton(opts.pin);
}

/**
 * Create a Button component on the current maker board attached to the
 * specified pin. Validate that pin is between 0 and 2 (for MB captouch)
 * @param {number} opts.pin
 */
export function createCapacitiveTouchSensor(opts) {
  apiValidateTypeAndRange(
    opts,
    'createCapacitiveTouchSensor',
    'pin',
    opts.pin,
    'pinid',
    0,
    2
  );
  return board.createCapacitiveTouchSensor(opts.pin);
}
