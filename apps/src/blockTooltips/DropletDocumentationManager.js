var DropletFunctionDocumentation = require('./DropletFunctionDocumentation');

/**
 * @fileoverview Manages a store of known blocks and tooltips
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
/* global $ */
'use strict';

/**
 * Store for finding tooltips for blocks
 * @constructor
 */
var DropletDocumentationManager = module.exports = function () {
  /**
   * @type {Object.<String, DropletFunctionDocumentation>}
   */
  this.blockTypeToTooltip = {};
};

/**
 * @param {Array.<Object>} dropletPalette array of Droplet category definitions
 */
DropletDocumentationManager.prototype.registerBlocksFromPalette = function (dropletPalette) {
  dropletPalette.forEach(function (dropletCategory) {
    dropletCategory.blocks.forEach(function (dropletCategoryBlockPair) {
      this.blockTypeToTooltip[dropletCategoryBlockPair.title] =
        new DropletFunctionDocumentation(dropletCategoryBlockPair.title);
    }, this);
  }, this);
};

/**
 * @param {String} functionName
 * @returns {DropletFunctionDocumentation}
 */
DropletDocumentationManager.prototype.getDocumentation = function (functionName) {
  if (!this.blockTypeToTooltip.hasOwnProperty(functionName)) {
    throw "Function name " + functionName + " not registered in documentation manager.";
  }

  return this.blockTypeToTooltip[functionName];
};
