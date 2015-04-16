var DropletFunctionTooltip = require('./DropletFunctionTooltip');

/**
 * @fileoverview Manages a store of known blocks and tooltips
 */

/**
 * Store for finding tooltips for blocks
 * @param {Droplet.Editor} dropletEditor
 * @constructor
 */
var DropletTooltipManager = function (dropletEditor) {
  /**
   * Map of block types to tooltip objects
   * @type {Object.<String, DropletFunctionTooltip>}
   */
  this.blockTypeToTooltip = {};

  /**
   * @type {Droplet.Editor}
   * @private
   */
  this.dropletEditor_ = dropletEditor;

  this.hideTooltipsOnBlockPick_();
};

var DEFAULT_TOOLTIP_CONFIG = {
  interactive: true,
  speed: 150,
  maxWidth: 450,
  position: 'right',
  contentAsHTML: true,
  theme: 'droplet-block-tooltipster',
  offsetY: 2
};

/**
 * Tooltipster's hideOnClick setting does not work with the droplet hover
 * overlay as-is. Hide the tooltip on block picking explicitly.
 */
DropletTooltipManager.prototype.hideTooltipsOnBlockPick_ = function () {
  if (!window.$) {
    return; // TODO(bjordan): remove when $ available on dev server
  }

  this.dropletEditor_.on('pickblock', function () {
    $('.tooltipstered').tooltipster('hide');
  });
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

    var hoverDivWidth = $(blockHoverDiv).width();
    var hoverDivLeftToToolboxRight = $(".droplet-palette-canvas").width() -
      parseInt(blockHoverDiv.style.left, 10);
    var desiredXPosition = Math.min(hoverDivWidth, hoverDivLeftToToolboxRight);
    var tooltipOffsetX = desiredXPosition - hoverDivWidth;

    var configuration = $.extend({}, DEFAULT_TOOLTIP_CONFIG, {
      content: self.getDropletTooltip(funcName).getTooltipHTML(),
      offsetX: tooltipOffsetX
    });

    $(blockHoverDiv).tooltipster(configuration);
  });
};

module.exports = DropletTooltipManager;
