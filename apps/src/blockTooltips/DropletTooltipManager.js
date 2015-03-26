var DropletFunctionTooltip = require('./DropletFunctionTooltip');

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
var DropletTooltipManager = module.exports = function () {
  /**
   * Map of block types to tooltip objects
   * @type {Object.<String, DropletFunctionTooltip>}
   */
  this.blockTypeToTooltip = {};
};

var repositionLastTooltip = function () {
  var tooltipBase = $(".tooltipster-base").last();
  var tooltipsterOffset = tooltipBase.offset();
  var dropletToolboxArea = $('.droplet-palette-wrapper');
  var rightSideOfToolbox = dropletToolboxArea.offset().left +
    dropletToolboxArea.width();
  var rightSideOfBlock = tooltipsterOffset.left;
  var tipWidth = 8;
  tooltipsterOffset.left = Math.min(rightSideOfBlock, rightSideOfToolbox + tipWidth);
  tooltipsterOffset.top -= 2; // Account for block notch height
  tooltipBase.offset(tooltipsterOffset);
};

var DEFAULT_TOOLTIP_CONFIG = {
  interactive: true,
  speed: 150,
  maxWidth: 450,
  position: 'right',
  contentAsHTML: true,
  functionReady: repositionLastTooltip,
  theme: 'droplet-block-tooltipster'
  // hideOnClick: true // Does not work with the droplet hover overlay (passing through click events?)
};

/**
 * @param {Array.<Object>} dropletPalette array of Droplet category definitions
 */
DropletTooltipManager.prototype.registerBlocksFromPalette = function (dropletPalette) {
  dropletPalette.forEach(function (dropletCategory) {
    dropletCategory.blocks.forEach(function (dropletCategoryBlockPair) {
      this.blockTypeToTooltip[dropletCategoryBlockPair.title] =
        new DropletFunctionTooltip(dropletCategoryBlockPair.title);
    }, this);
  }, this);
};

/**
 * @param {String} functionName
 * @returns {DropletFunctionTooltip}
 */
DropletTooltipManager.prototype.getDropletTooltip = function (functionName) {
  if (!this.blockTypeToTooltip.hasOwnProperty(functionName)) {
    throw "Function name " + functionName + " not registered in documentation manager.";
  }

  return this.blockTypeToTooltip[functionName];
};

DropletTooltipManager.prototype.installTooltipsOnVisibleToolboxBlocks = function () {
  var self = this;
  $('.droplet-hover-div').each(function (_, blockHoverDiv) {
    if ($(blockHoverDiv).hasClass('tooltipstered')) {
      return;
    }

    var funcName = $(blockHoverDiv).attr('title');
    $(blockHoverDiv).tooltipster($.extend({}, DEFAULT_TOOLTIP_CONFIG, {
      content: self.getDropletTooltip(funcName).getTooltipHTML()
    }));
  });
};

