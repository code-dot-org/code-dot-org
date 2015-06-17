var msg = require('../locale');
var utils = require('../utils');

/**
 * @fileoverview Representation of a droplet function/block's tooltip
 */

var DROPLET_BLOCK_I18N_PREFIX = "dropletBlock_";

/**
 * @typedef {Object} parameterInfo
 * @property {String} name
 * @property {?String} description
 */

/**
 * Stores a block's tooltip information and helps render it
 * Grabs much of the tooltip's information from either app-specific locale
 * file (passed in as appMsg) or, if not present, the 'common' locale file,
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
var DropletFunctionTooltip = function (appMsg, definition) {
  this.appMsg = appMsg;

  /** @type {string} */
  this.functionName = definition.func;

  var description = this.getLocalization(this.descriptionKey());
  if (description) {
    this.description = description();
  }

  var signatureOverride = this.getLocalization(this.signatureOverrideKey());
  if (signatureOverride) {
    this.signatureOverride = signatureOverride();
  }

  /** @type {Array.<parameterInfo>} */
  this.parameterInfos = [];

  for (var paramId = 0; ; paramId++) {
    var paramName = this.getLocalization(this.parameterNameKey(paramId));
    if (!paramName) {
      break;
    }

    var paramInfo = {};
    paramInfo.name = paramName();
    var paramDesc = this.getLocalization(this.parameterDescriptionKey(paramId));
    if (paramDesc) {
      paramInfo.description = paramDesc();
    }
    if (definition.assetTooltip) {
      paramInfo.assetTooltip = definition.assetTooltip[paramId];
    }
    this.parameterInfos.push(paramInfo);
  }
};

/**
 * @param {string} key
 * @returns {Function}
 */
DropletFunctionTooltip.prototype.getLocalization = function (key) {
  return this.appMsg[key] || msg[key];
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
DropletFunctionTooltip.prototype.parameterNameKey = function (paramIndex) {
  return this.i18nPrefix() + "_param" + paramIndex;
};

/**
 * @param {Number} paramIndex
 * @returns {string}
 */
DropletFunctionTooltip.prototype.parameterDescriptionKey = function (paramIndex) {
  return this.i18nPrefix() + "_param" + paramIndex + '_description';
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
  return '//' + utils.getPegasusHost() + '/applab/docs/' + this.functionName + '?embedded';
};

module.exports = DropletFunctionTooltip;
