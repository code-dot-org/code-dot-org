/** @file Maker commands (invoked by Applab/Gamelab.executeCmd) */
import {apiValidateType} from '@cdo/apps/javascriptMode';
/* global Applab */ // TODO (bbuchanan): Inject Applab or makerController.

const commands = {

  /**
   * @param {string|number} opts.pin
   * @param {string} opts.mode
   */
  pinMode(opts) {
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
  },

  /**
   * Execute some code every X milliseconds.  This is effectively setInterval()
   * with a cleaner interface.
   * @param {number} opts.ms How often to invoke the code in the loop,
   *        in milliseconds.
   * @param {function(function)} opts.callback Code to invoke in each loop
   *        iteration. Gets passed an 'exit' function that will stop the loop.
   */
  timedLoop(opts) {
    apiValidateType(opts, 'timedLoop', 'ms', opts.ms, 'number');
    apiValidateType(opts, 'timedLoop', 'callback', opts.callback, 'function');
    const {ms, callback} = opts;

    let intervalKey;
    const exit = function exit() {
      clearInterval(intervalKey);
    };
    intervalKey = setInterval(() => callback(exit), ms);
  }

};
export default commands;
