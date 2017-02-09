/** @file Maker commands (invoked by Applab/Gamelab.executeCmd) */
import {
  apiValidateType,
  apiValidateTypeAndRange
} from '../../util/javascriptMode';
/* global Applab */ // TODO (bbuchanan): Inject Applab or makerController.

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

  Applab.makerController.pinMode(opts.pin, modeStringToConstant[opts.mode]);
}

/**
 * @param {string|number} opts.pin
 * @param {number} opts.value
 */
export function digitalWrite(opts) {
  apiValidateType(opts, 'digitalWrite', 'pin', opts.pin, 'pinid');
  apiValidateTypeAndRange(opts, 'digitalWrite', 'value', opts.value, 'number', 0, 1);

  Applab.makerController.digitalWrite(opts.pin, opts.value);
}

/**
 * @param {string|number} opts.pin
 */
export function digitalRead(opts) {
  apiValidateType(opts, 'digitalRead', 'pin', opts.pin, 'pinid');

  return Applab.makerController.digitalRead(opts.pin, opts.callback);
}

/**
 * Execute some code every X milliseconds.  This is effectively setInterval()
 * with a cleaner interface.
 * @param {number} opts.ms How often to invoke the code in the loop,
 *        in milliseconds.
 * @param {function(function)} opts.callback Code to invoke in each loop
 *        iteration. Gets passed an 'exit' function that will stop the loop.
 */
export function timedLoop(opts) {
  apiValidateType(opts, 'timedLoop', 'ms', opts.ms, 'number');
  apiValidateType(opts, 'timedLoop', 'callback', opts.callback, 'function');
  const {ms, callback} = opts;

  let intervalKey;
  const exit = function exit() {
    clearInterval(intervalKey);
  };
  intervalKey = setInterval(() => callback(exit), ms);
}
