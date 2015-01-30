/**
 * Copyright 2015 Code.org
 * http://code.org/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Logging API to control log levels and support different browsers
 */

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

var _ = require('../utils').getLodash();

/**
 * A logger instance
 * @constructor
 * @param {Console} window console API
 * @param {LogLevel} verbosity
 */
var NetSimLogger = function (outputConsole, verbosity /*=VERBOSE*/) {
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
module.exports = NetSimLogger;

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
      _.bind(this.outputConsole_.log, this.outputConsole_) : function () {};

  if (verbosity >= LogLevel.INFO) {
    this.info = (this.outputConsole_ && this.outputConsole_.info) ?
        _.bind(this.outputConsole_.info, this.outputConsole_) : this.log_;
  } else {
    this.info = function () {};
  }

  if (verbosity >= LogLevel.WARN) {
    this.warn = (this.outputConsole_ && this.outputConsole_.warn) ?
        _.bind(this.outputConsole_.warn, this.outputConsole_) : this.log_;
  } else {
    this.warn = function () {};
  }

  if (verbosity >= LogLevel.ERROR) {
    this.error = (this.outputConsole_ && this.outputConsole_.error) ?
        _.bind(this.outputConsole_.error, this.outputConsole_) : this.log_;
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
