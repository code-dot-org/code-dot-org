/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
'use strict';

/**
 * Logging API to control log levels and support different browsers
 * @constructor
 * @param {Console} window console API
 * @param {LogLevel} verbosity
 */
var NetSimLogger = module.exports = function (outputConsole, verbosity /*=VERBOSE*/) {
  /**
   * @type {Console}
   * @private
   */
  this.outputConsole_ = outputConsole;

  /**
   * Always mapped to console.log, or no-op if not available.
   * @type {Function}
   * @private
   */
  this.log_ = function () {};

  /**
   * If configured for info logging, gets mapped to console.info,
   * falls back to console.log, or no-op.
   * @type {Function}
   */
  this.info = function () {};

  /**
   * If configured for warning logging, gets mapped to console.warn,
   * falls back to console.log, or no-op.
   * @type {Function}
   */
  this.warn = function () {};

  /**
   * If configured for error logging, gets mapped to console.error,
   * falls back to console.log, or no-op.
   * @type {Function}
   */
  this.error = function () {};

  this.initializeWithVerbosity_((undefined === verbosity) ?
      LogLevel.VERBOSE : verbosity);
};

/**
 * Log verbosity levels enum.
 * @readonly
 * @enum {number}
 */
var LogLevel = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  VERBOSE: 4
};
NetSimLogger.LogLevel = LogLevel;

/**
 * Binds internal function calls according to given verbosity level.
 * @param verbosity
 * @private
 */
NetSimLogger.prototype.initializeWithVerbosity_ = function (verbosity) {
  this.log_ = (this.outputConsole_ && this.outputConsole_.log) ?
      this.outputConsole_.log.bind(this.outputConsole_) : function () {};

  if (verbosity >= LogLevel.INFO) {
    this.info = (this.outputConsole_ && this.outputConsole_.info) ?
        this.outputConsole_.info.bind(this.outputConsole_) : this.log_;
  } else {
    this.info = function () {};
  }

  if (verbosity >= LogLevel.WARN) {
    this.warn = (this.outputConsole_ && this.outputConsole_.warn) ?
        this.outputConsole_.warn.bind(this.outputConsole_) : this.log_;
  } else {
    this.warn = function () {};
  }

  if (verbosity >= LogLevel.ERROR) {
    this.error = (this.outputConsole_ && this.outputConsole_.error) ?
        this.outputConsole_.error.bind(this.outputConsole_) : this.log_;
  } else {
    this.error = function () {};
  }
};

/**
 * Writes to output, depending on log level
 * @param {*} message
 * @param {LogLevel} logLevel
 */
NetSimLogger.prototype.log = function (message, logLevel /*=INFO*/) {
  if (undefined === logLevel) {
    logLevel = LogLevel.INFO;
  }

  switch (logLevel) {
    case LogLevel.ERROR:
      this.error(message);
      break;
    case LogLevel.WARN:
      this.warn(message);
      break;
    case LogLevel.INFO:
      this.info(message);
      break;
    default:
      this.log_(message);
  }
};
