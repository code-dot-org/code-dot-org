var DropletBlockTooltipMarkup = require('./DropletBlockTooltip.html');
var msg = require('../../locale/current/common');

/**
 * @fileoverview Representation of a block's tooltip
 */
'use strict';

/**
 * Represents a block's tooltip
 * @constructor
 */
var DropletFunctionDocumentation = function (functionName) {
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

DropletFunctionDocumentation.prototype.descriptionKey = function () {
  return this.i18nPrefix() + "_description";
};

DropletFunctionDocumentation.prototype.parameterKey = function (paramIndex) {
  return this.i18nPrefix() + "_param" + paramIndex;
};

DropletFunctionDocumentation.prototype.i18nPrefix = function () {
  return DROPLET_DOC_I18N_PREFIX + this.functionName;
};

/**
 * @returns {String} HTML for tooltip
 */
DropletFunctionDocumentation.prototype.getTooltipHTML = function () {
  return DropletBlockTooltipMarkup({
    functionName: this.functionName,
    functionShortDescription: this.description,
    parameters: this.paramNames
  });
};

module.exports = DropletFunctionDocumentation;
