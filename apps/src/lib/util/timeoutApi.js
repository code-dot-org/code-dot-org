/**
 * @file Droplet-friendly command defintions for timeout and
 * interval commands (shared between App Lab and Game Lab).
 */
import * as apiTimeoutList from './timeoutList';
import {
  apiValidateType,
  OPTIONAL
} from './javascriptMode';

/**
 * Inject an executeCmd method so this mini-library can be used in both
 * App Lab and Game Lab
 */
let executeCmd;
export function injectExecuteCmd(fn) {
  executeCmd = fn;
}

function onTimerFired(opts) {
  opts.callback.call(null);
}

/**
 * Export a set of native code fucntions that student code can execute
 * via the interpreter.
 * Must be mixed in ot the app's command list (see applab/commands.js)
 * @type {{}}
 */
export const commands ={
  setTimeout(opts) {
    // PARAMNAME: setTimeout: callback vs. function
    // PARAMNAME: setTimeout: ms vs. milliseconds
    apiValidateType(opts, 'setTimeout', 'callback', opts.callback, 'function');
    apiValidateType(opts, 'setTimeout', 'milliseconds', opts.milliseconds, 'number');

    return apiTimeoutList.setTimeout(onTimerFired.bind(this, opts), opts.milliseconds);
  },

  clearTimeout(opts) {
    apiValidateType(opts, 'clearTimeout', 'timeoutId', opts.timeoutId, 'number');
    // NOTE: we do not currently check to see if this is a timer created by
    // our applabCommands.setTimeout() function
    apiTimeoutList.clearTimeout(opts.timeoutId);
  },

  setInterval(opts) {
    // PARAMNAME: setInterval: callback vs. function
    // PARAMNAME: setInterval: ms vs. milliseconds
    apiValidateType(opts, 'setInterval', 'callback', opts.callback, 'function');
    apiValidateType(opts, 'setInterval', 'milliseconds', opts.milliseconds, 'number');

    return apiTimeoutList.setInterval(onTimerFired.bind(this, opts), opts.milliseconds);
  },

  clearInterval(opts) {
    apiValidateType(opts, 'clearInterval', 'intervalId', opts.intervalId, 'number');
    // NOTE: we do not currently check to see if this is a timer created by
    // our applabCommands.setInterval() function
    apiTimeoutList.clearInterval(opts.intervalId);
  },

  /**
   * Execute some code every X milliseconds.  This is effectively setInterval()
   * with a cleaner interface.
   * @param {number} opts.ms How often to invoke the code in the loop,
   *   in milliseconds.
   * @param {function(function)} opts.callback Code to invoke in each loop
   *   iteration.
   * @return {number} a timeout key
   */
  timedLoop(opts) {
    apiValidateType(opts, 'timedLoop', 'ms', opts.ms, 'number');
    apiValidateType(opts, 'timedLoop', 'callback', opts.callback, 'function');
    return apiTimeoutList.timedLoop(opts.ms, onTimerFired.bind(this, opts));
  },

  /**
   * Stop all running intervals that were started with `timedLoop()`.
   * @param {number} [opts.key] - if omitted, stop _all_ timedLoops.
   */
  stopTimedLoop(opts) {
    apiValidateType(opts, 'stopTimedLoop', 'key', opts.key, 'number', OPTIONAL);
    apiTimeoutList.stopTimedLoop(opts.key);
  },
};

/**
 * Pass-through functions that call the configured `executeCmd` method with
 * arguments converted to an options object.
 */
export const executors = {
  setTimeout: (callback, milliseconds) => executeCmd(null, 'setTimeout', {callback, milliseconds}),
  clearTimeout: (timeoutId) => executeCmd(null, 'clearTimeout', {timeoutId}),
  setInterval: (callback, milliseconds) => executeCmd(null, 'setInterval', {callback, milliseconds}),
  clearInterval: (intervalId) => executeCmd(null, 'clearInterval', {intervalId}),
  timedLoop: (ms, callback) => executeCmd(null, 'timedLoop', {ms, callback}),
  stopTimedLoop: (key) => executeCmd(null, 'stopTimedLoop', {key}),
};

/**
 * Droplet palette configuration entries, ready to drop in to their respective
 * toolkits.
 */
export const dropletConfig = {
  setTimeout: {
    func: 'setTimeout',
    parent: executors,
    category: 'Control',
    type: 'either',
    paletteParams: ['callback', 'ms'],
    params: ["function() {\n  \n}", "1000"],
    allowFunctionDrop: {0: true}
  },
  clearTimeout: {
    func: 'clearTimeout',
    parent: executors,
    category: 'Control',
    paletteParams: ['__'],
    params: ["__"]
  },
  setInterval: {
    func: 'setInterval',
    parent: executors,
    category: 'Control',
    type: 'either',
    paletteParams: ['callback', 'ms'],
    params: ["function() {\n  \n}", "1000"],
    allowFunctionDrop: {0: true}
  },
  clearInterval: {
    func: 'clearInterval',
    parent: executors,
    category: 'Control',
    paletteParams: ['__'],
    params: ["__"]
  },
  timedLoop: {
    func: 'timedLoop',
    parent: executors,
    category: 'Control',
    paletteParams: ['ms', 'callback'],
    params: ['1000', 'function() {\n  \n}'],
    allowFunctionDrop: {1: true}
  },
  stopTimedLoop: {
    func: 'stopTimedLoop',
    parent: executors,
    category: 'Control',
    paramButtons: {minArgs: 0, maxArgs: 1}
  },
};
