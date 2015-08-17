/* global $ */

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
DropletBlockTooltipManager.prototype.installTooltipsForEditor_ = function (dropletEditor) {
  this.installTooltipsForCurrentCategoryBlocks(dropletEditor);
  this.hideTooltipsOnBlockPick_(dropletEditor);

  dropletEditor.on('changepalette', this.installTooltipsForCurrentCategoryBlocks.bind(this));
  dropletEditor.on('toggledone', this.installTooltipsIfNotInstalled.bind(this));
};

DropletBlockTooltipManager.prototype.installTooltipsIfNotInstalled = function () {
  if (!$('.droplet-hover-div').hasClass('tooltipstered')) {
    this.installTooltipsForCurrentCategoryBlocks();
  }
};

DropletBlockTooltipManager.prototype.installTooltipsForCurrentCategoryBlocks = function () {
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
    functionShortDescription: tooltipInfo.description,
    parameters: tooltipInfo.parameterInfos,
    signatureOverride: tooltipInfo.signatureOverride,
    fullDocumentationURL: tooltipInfo.getFullDocumentationURL()
  });
};

module.exports = DropletBlockTooltipManager;
