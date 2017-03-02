/** @file Maker commands (invoked by Applab/Gamelab.executeCmd) */
import {
  apiValidateType,
  apiValidateTypeAndRange
} from '../../util/javascriptMode';

let globalBoardController;
export function injectBoardController(bc) {
  globalBoardController = bc;
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

  globalBoardController.pinMode(opts.pin, modeStringToConstant[opts.mode]);
}

/**
 * @param {string|number} opts.pin
 * @param {number} opts.value
 */
export function digitalWrite(opts) {
  apiValidateType(opts, 'digitalWrite', 'pin', opts.pin, 'pinid');
  apiValidateTypeAndRange(opts, 'digitalWrite', 'value', opts.value, 'number', 0, 1);

  globalBoardController.digitalWrite(opts.pin, opts.value);
}

/**
 * @param {string|number} opts.pin
 */
export function digitalRead(opts) {
  apiValidateType(opts, 'digitalRead', 'pin', opts.pin, 'pinid');

  return globalBoardController.digitalRead(opts.pin, opts.callback);
}

/**
 * @param {string|number} opts.pin
 * @param {number} opts.value
 */
export function analogWrite(opts) {
  apiValidateType(opts, 'analogWrite', 'pin', opts.pin, 'pinid');
  apiValidateTypeAndRange(opts, 'analogWrite', 'value', opts.value, 'number', 0, 255);

  globalBoardController.analogWrite(opts.pin, opts.value);
}

/**
 * @param {string|number} opts.pin
 */
export function analogRead(opts) {
  apiValidateType(opts, 'analogRead', 'pin', opts.pin, 'pinid');

  return globalBoardController.analogRead(opts.pin, opts.callback);
}

/**
 * Add a handler for a maker board event from a particular board component.
 * @param {Object} opts.component
 * @param {string} opts.event
 * @param {function} opts.callback
 */
export function onBoardEvent(opts) {
  // TODO (bbuchanan): Validate arguments?
  return globalBoardController.onBoardEvent(opts.component, opts.event, opts.callback);
}
