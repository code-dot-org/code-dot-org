var DropletBlockTooltipMarkup = require('./DropletBlockTooltip.html');
var msg = require('../../locale/current/common');

/**
 * @fileoverview Representation of a droplet function/block's tooltip
 */
'use strict';

/**
 * Stores a block's tooltip information and helps render it
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

  /** @type {Array.<String>} */
  this.paramNames = [];

  var paramId = 0;
  while (msg.hasOwnProperty(this.parameterKey(paramId))) {
    this.paramNames.push(msg[this.parameterKey(paramId)]());
    paramId++;
  }
};

var DROPLET_DOC_I18N_PREFIX = "dropletBlock_";

DropletFunctionTooltip.prototype.descriptionKey = function () {
  return this.i18nPrefix() + "_description";
};

DropletFunctionTooltip.prototype.parameterKey = function (paramIndex) {
  return this.i18nPrefix() + "_param" + paramIndex;
};

DropletFunctionTooltip.prototype.i18nPrefix = function () {
  return DROPLET_DOC_I18N_PREFIX + this.functionName;
};

/**
 * @returns {String} HTML for tooltip
 */
DropletFunctionTooltip.prototype.getTooltipHTML = function () {
  return DropletBlockTooltipMarkup({
    functionName: this.functionName,
    functionShortDescription: this.description,
    parameters: this.paramNames
  });
};

module.exports = DropletFunctionTooltip;
