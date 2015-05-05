var msg = require('../../locale/current/common');

/**
 * @fileoverview Representation of a droplet function/block's tooltip
 */

var DROPLET_BLOCK_I18N_PREFIX = "dropletBlock_";

/**
 * Stores a block's tooltip information and helps render it
 * Grabs much of the tooltip's information from the 'common' locale file,
 * (apps/i18n/common/en_us.json), keyed by the function name.
 *
 * e.g.,
 *
 * "dropletBlock_readRecords_description": "Reads records [...].",
 * "dropletBlock_readRecords_param0": "table",
 * "dropletBlock_readRecords_param1": "searchParams",
 * "dropletBlock_readRecords_param2": "onSuccess",
 *
 * Will result in a tooltip with the contents:
 *
 *    readRecords(table, searchParams, onSuccess)
 *    Reads records [...].
 *    [Read More] (links to `readRecords` doc file)
 *
 * Blocks which have functionNames that should not be user-visible can define
 * their own signature override.
 *
 * e.g.,
 *
 * "dropletBlock_functionParams_n_description": "Define a function with a given parameter",
 * "dropletBlock_functionParams_n_signatureOverride": "Function with a Parameter",
 *
 * Will result in a tooltip with the contents:
 *
 *    Function with a Parameter <-- note, no ()s
 *    Define a function with a given parameter.
 *    [Read More] (links to `functionParams_n` doc file)
 *
 * @constructor
 */
var DropletFunctionTooltip = function (functionName) {
  /** @type {String} */
  this.functionName = functionName;

  /** @type {String} */
  this.description = null;

  if (msg.hasOwnProperty(this.descriptionKey())) {
    this.description = msg[this.descriptionKey()]();
  }

  if (msg.hasOwnProperty(this.signatureOverrideKey())) {
    this.signatureOverride = msg[this.signatureOverrideKey()]();
  }

  /** @type {Array.<String>} */
  this.paramNames = [];

  var paramId = 0;
  while (msg.hasOwnProperty(this.parameterKey(paramId))) {
    this.paramNames.push(msg[this.parameterKey(paramId)]());
    paramId++;
  }
};

/**
 * @returns {string}
 */
DropletFunctionTooltip.prototype.descriptionKey = function () {
  return this.i18nPrefix() + "_description";
};

/**
 * @returns {string}
 */
DropletFunctionTooltip.prototype.signatureOverrideKey = function () {
  return this.i18nPrefix() + "_signatureOverride";
};

/**
 * @param {Number} paramIndex
 * @returns {string}
 */
DropletFunctionTooltip.prototype.parameterKey = function (paramIndex) {
  return this.i18nPrefix() + "_param" + paramIndex;
};

/**
 * @returns {string} i18n file prefix for this function
 */
DropletFunctionTooltip.prototype.i18nPrefix = function () {
  return DROPLET_BLOCK_I18N_PREFIX + this.functionName;
};

/**
 * @returns {string} URL for full doc about this function
 */
DropletFunctionTooltip.prototype.getFullDocumentationURL = function () {
  return 'http://code.org/applab/docs/' + this.functionName;
};

module.exports = DropletFunctionTooltip;
