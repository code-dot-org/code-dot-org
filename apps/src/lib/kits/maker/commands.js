/** @file Maker commands (invoked by Applab/Gamelab.executeCmd) */
import {
  apiValidateType,
  apiValidateTypeAndRange
} from '../../util/javascriptMode';

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
  apiValidateTypeAndRange(opts, 'digitalWrite', 'value', opts.value, 'number', 0, 1);

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
  apiValidateTypeAndRange(opts, 'analogWrite', 'value', opts.value, 'number', 0, 255);

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
 * Add a handler for a maker board event from a particular board component.
 * @param {Object} opts.component
 * @param {string} opts.event
 * @param {function} opts.callback
 */
export function onBoardEvent(opts) {
  // TODO (bbuchanan): Validate arguments?
  return board.onBoardEvent(opts.component, opts.event, opts.callback);
}
