var DropletFunctionTooltip = require('./DropletFunctionTooltip');

/**
 * @fileoverview Manages a store of known blocks and tooltips
 */

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

var DEFAULT_TOOLTIP_CONFIG = {
  interactive: true,
  speed: 150,
  maxWidth: 450,
  position: 'right',
  contentAsHTML: true,
  functionReady: repositionLastTooltip,
  theme: 'droplet-block-tooltipster'
  /**
   * hideOnClick does not work with the droplet hover overlay
   * (passing through click events?)
   */
};

/**
 * @param {DropletBlock[]} dropletBlocks list of Droplet block definitions for
 *    which to register documentation
 */
DropletTooltipManager.prototype.registerBlocksFromList = function (dropletBlocks) {
  dropletBlocks.forEach(function (dropletBlockDefinition) {
    this.blockTypeToTooltip[dropletBlockDefinition.func] =
      new DropletFunctionTooltip(dropletBlockDefinition.func);
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
  if (!window.$) {
    return; // TODO(bjordan): remove when $ available on dev server
  }

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

function repositionLastTooltip() {
  var tooltipBase = $(".tooltipster-base").last();
  var tooltipOffset = tooltipBase.offset();
  var dropletToolboxArea = $('.droplet-palette-wrapper');
  var rightSideOfToolbox = dropletToolboxArea.offset().left +
    dropletToolboxArea.width();
  var rightSideOfBlock = tooltipOffset.left;
  var tipWidth = 8;
  tooltipOffset.left = Math.min(rightSideOfBlock, rightSideOfToolbox + tipWidth);
  var blockNotchHeight = 4;
  tooltipOffset.top -= blockNotchHeight / 2;
  tooltipBase.offset(tooltipOffset);
}
