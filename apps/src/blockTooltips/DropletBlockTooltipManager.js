var DropletFunctionTooltip = require('./DropletFunctionTooltip');
var DropletFunctionTooltipMarkup = require('./DropletFunctionTooltip.html.ejs');

/**
 * @fileoverview Displays tooltips for Droplet blocks
 */

/**
 * Handles displaying tooltips on Droplet blocks
 * @param {DropletTooltipManager} dropletTooltipManager
 * @constructor
 */
var DropletBlockTooltipManager = function (dropletTooltipManager) {
  this.dropletTooltipManager = dropletTooltipManager;
};

var DEFAULT_TOOLTIP_CONFIG = {
  interactive: true,
  speed: 150,
  maxWidth: 450,
  position: 'right',
  contentAsHTML: true,
  theme: 'droplet-block-tooltipster',
  offsetY: 2,
  delay: 400
};

/**
 * @param {Editor} dropletEditor
 */
DropletBlockTooltipManager.prototype.registerHandlers = function (dropletEditor) {
  this.installTooltipsForCurrentCategoryBlocks(dropletEditor);
  this.hideTooltipsOnBlockPick_(dropletEditor);

  dropletEditor.on('changepalette', this.installTooltipsForCurrentCategoryBlocks.bind(this));
  dropletEditor.on('toggledone', this.installTooltipsIfNotInstalled.bind(this));
};

DropletBlockTooltipManager.prototype.installTooltipsIfNotInstalled = function () {
  if (!window.$) {
    return; // TODO(bjordan): remove when $ available on dev server
  }

  if (!$('.droplet-hover-div').hasClass('tooltipstered')) {
    this.installTooltipsForCurrentCategoryBlocks();
  }
};

DropletBlockTooltipManager.prototype.installTooltipsForCurrentCategoryBlocks = function () {
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
    var hoverDivLeftToToolboxRight = $('.droplet-palette-canvas').width() -
      parseInt(blockHoverDiv.style.left, 10);
    var desiredXPosition = Math.min(hoverDivWidth, hoverDivLeftToToolboxRight);
    var tooltipOffsetX = desiredXPosition - hoverDivWidth;

    var configuration = $.extend({}, DEFAULT_TOOLTIP_CONFIG, {
      content: self.getTooltipHTML(funcName),
      offsetX: tooltipOffsetX
    });

    $(blockHoverDiv).tooltipster(configuration);
  });
};

/**
 * Tooltipster's hideOnClick setting does not work with the droplet hover
 * overlay as-is. Hide the tooltip on block picking explicitly.
 */
DropletBlockTooltipManager.prototype.hideTooltipsOnBlockPick_ = function (dropletEditor) {
  if (!window.$) {
    return; // TODO(bjordan): remove when $ available on dev server
  }

  dropletEditor.on('pickblock', function () {
    $('.tooltipstered').tooltipster('hide');
  });
};

/**
 * @returns {String} HTML for tooltip
 */
DropletBlockTooltipManager.prototype.getTooltipHTML = function (functionName) {
  var tooltipInfo = this.dropletTooltipManager.getDropletTooltip(functionName);
  return DropletFunctionTooltipMarkup({
    functionName: tooltipInfo.functionName,
    functionShortDescription: tooltipInfo.description,
    parameters: tooltipInfo.paramNames,
    signatureOverride: tooltipInfo.signatureOverride,
    fullDocumentationURL: tooltipInfo.getFullDocumentationURL()
  });
};

module.exports = DropletBlockTooltipManager;
