/** @file Observes a JSInterpreter and logs to the designated browser console. */
'use strict';

var Observer = require('./Observer');

/**
 * Observer responsible for logging to the provided browser console when
 * the interpreter it is observing raises log-worthy events.
 * @constructor
 * @param {Console} window console API
 */
var JsInterpreterLogger = module.exports = function (outputConsole) {
  /** @private {Console} */
  this.outputConsole_ = outputConsole;

  /** @private {Observer} */
  this.observer_ = new Observer();
};

/**
 * Attach the logger to a particular JSInterpreter instance.
 * @param {JSInterpreter} jsInterpreter
 */
JsInterpreterLogger.prototype.attachTo = function (jsInterpreter) {
  this.observer_.observe(jsInterpreter.onExecutionWarning,
      this.log.bind(this));
};

/**
 * Detach the logger from whatever interpreter instance it is currently
 * attached to, unregistering handlers.
 * Safe to call when the logger is already detached.
 */
JsInterpreterLogger.prototype.detach = function () {
  this.observer_.unobserveAll();
};

/**
 * Log to the console object we were constructed with.
 * @param {*} arguments...
 * @see Console.log
 */
JsInterpreterLogger.prototype.log = function () {
  if (this.outputConsole_ && this.outputConsole_.log) {
    this.outputConsole_.log.apply(this.outputConsole_, arguments);
  }
};
