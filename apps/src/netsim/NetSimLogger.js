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

/**
 * A logger instance
 * @constructor
 * @param {LogLevel} verbosity
 */
var NetSimLogger = function (verbosity /*=VERBOSE*/) {
  /**
   * How much logging to pass through to output.
   * @type {LogLevel}
   */
  this.verbosity = (undefined === verbosity) ? LogLevel.VERBOSE : verbosity;
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
 * Writes to output, depending on log level
 * @param {*} message
 * @param {LogLevel} logLevel
 */
NetSimLogger.prototype.log = function (message, logLevel /*=INFO*/) {
  if (undefined === logLevel) {
    logLevel = LogLevel.INFO;
  }

  // For now, just assume we're writing to the web console.
  if (this.verbosity >= logLevel) {
    if (console && console.log) {
      switch (logLevel) {
        case LogLevel.ERROR:
            if (console.error) {
              console.error(message);
            } else {
              console.log(message);
            }
          break;
        case LogLevel.WARN:
            if (console.warn) {
              console.warn(message);
            } else {
              console.log(message);
            }
          break;
        case LogLevel.INFO:
            if (console.info) {
              console.info(message);
            } else {
              console.log(message);
            }
          break;
        default:
            console.log(message);
          break;
      }
    }
  }
};
