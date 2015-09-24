/**
 * @file Custom error type for surfacing "errors" to the Applab user with
 *       line number, etc.
 */
/* jshint
 funcscope: true,
 newcap: true,
 nonew: true,
 shadow: false,
 unused: true,
 eqeqeq: true,

 maxlen: 90,
 maxparams: 3,
 maxstatements: 200
 */
'use strict';

var utils = require('../utils');
var ErrorLevel = require('./errorHandler').ErrorLevel;

/**
 * @param {string} message
 * @param {ErrorLevel} [errorLevel] - default ErrorLevel.ERROR
 * @constructor
 */
var ApplabError = module.exports = function (message, errorLevel) {
  this.name = 'ApplabError';
  this.message = message || 'Unspecified error.';
  this.stack = (new Error()).stack;

  /** @type {ErrorLevel} */
  this.errorLevel = utils.valueOr(errorLevel, ErrorLevel.ERROR);
};
ApplabError.inherits(Error);
