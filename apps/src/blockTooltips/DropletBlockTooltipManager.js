var DropletFunctionTooltip = require('./DropletFunctionTooltip');
var DropletFunctionTooltipMarkup = require('./DropletFunctionTooltip.html.ejs');
var dom = require('../dom');

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
  this.showExamplesLink = dropletTooltipManager.dropletConfig.showExamplesLink;
  this.tooltipsEnabled = true;
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
 * Simple helper function that will swallow exceptions, and log them as
 * console.error. This is done because the way that some of our callbacks are
 * called by droplet, exceptions would bubble down to the droplet code, and
 * prevent desired behavior (i.e. we fail to transition back to block mode).
 */
function swallowErrors(fn) {
  return function () {
    try {
      fn();
    } catch (err) {
      if (typeof(console) !== "undefined" && console.error) {
        console.error(err);
      }
    }
  };
}

/**
 * @param {Editor} dropletEditor
 */
DropletBlockTooltipManager.prototype.installTooltipsForEditor_ = function (dropletEditor) {
  this.installTooltipsForCurrentCategoryBlocks_();
  this.hideTooltipsOnBlockPick_(dropletEditor);

  dropletEditor.on('changepalette',
    swallowErrors(this.installTooltipsForCurrentCategoryBlocks_.bind(this)));
  dropletEditor.on('toggledone',
    swallowErrors(this.installTooltipsIfNotInstalled_.bind(this)));
};

DropletBlockTooltipManager.prototype.installTooltipsIfNotInstalled_ = function () {
  if (!$('.droplet-hover-div').hasClass('tooltipstered')) {
    this.installTooltipsForCurrentCategoryBlocks_();
  }
};

DropletBlockTooltipManager.prototype.installTooltipsForCurrentCategoryBlocks_ = function () {
  if (!this.tooltipsEnabled) {
    return;
  }

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
      content: this.getTooltipHTML(funcName),
      offsetX: tooltipOffsetX,
      functionReady: function (_, contents) {
        if (!this.showExamplesLink) {
          return;
        }
        var seeExamplesLink = contents.find('.tooltip-example-link > a')[0];
        // Important this binds to mouseDown/touchDown rather than click, needs to
        // happen before `blur` which triggers the ace editor completer popup
        // hide which in turn would hide the link and not show the docs.
        dom.addClickTouchEvent(seeExamplesLink, function (event) {
          this.dropletTooltipManager.showDocFor(funcName);
          event.stopPropagation();
        }.bind(this));
      }.bind(this)
    });

    // Store the title/funcName as a block id so we can attach callouts later:
    $(blockHoverDiv).attr('id', 'droplet_palette_block_' + funcName);
    $(blockHoverDiv).tooltipster(configuration);
  }.bind(this));
};

/**
 * Tooltipster's hideOnClick setting does not work with the droplet hover
 * overlay as-is. Hide the tooltip on block picking explicitly.
 */
DropletBlockTooltipManager.prototype.hideTooltipsOnBlockPick_ = function (dropletEditor) {
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
    isProperty: tooltipInfo.isProperty,
    tipPrefix: tooltipInfo.tipPrefix,
    functionShortDescription: tooltipInfo.description,
    parameters: tooltipInfo.parameterInfos,
    signatureOverride: tooltipInfo.signatureOverride,
    showExamplesLink: this.showExamplesLink
  });
};

/**
 * @param {boolean} enabled if tooltips should be enabled
 */

DropletBlockTooltipManager.prototype.setTooltipsEnabled = function (enabled) {
  this.tooltipsEnabled = !!enabled;
};

module.exports = DropletBlockTooltipManager;
