'use strict';

goog.provide('Blockly.ContractEditorSectionView');

/** @const */ var DOWN_TRIANGLE_CHARACTER = '\u25BC'; // ▼
/** @const */ var RIGHT_TRIANGLE_CHARACTER = '\u25B6'; // ▶
/** @const */ var DARK_GRAY_HEX = '#898989';
/** @const */ var YELLOW_HEX = '#ffa400';
/** @const */ var HIGHLIGHT_BOX_WIDTH = 10; //px
/** @const */ var DEFAULT_HEADER_HEIGHT = 50; //px

/**
 * Header with a block below it
 * @constructor
 * @param {SVGElement} canvas
 * @param {Object} opt_options
 *  {Function<boolean>} placeContentCallback
 *  {Function<boolean>} onCollapseCallback
 */
Blockly.ContractEditorSectionView = function (canvas, opt_options) {
  this.headerText_ = opt_options.headerText;
  this.onCollapseCallback_ = opt_options.onCollapseCallback;
  this.placeContentCallback = opt_options.placeContentCallback;
  this.headerHeight = opt_options.headerHeight || DEFAULT_HEADER_HEIGHT;
  /**
   * @type {?Blockly.SvgHighlightBox}
   */
  this.highlightBox_ = opt_options.highlightBox || null;

  // Whether this is the current highlight box target
  this.highlighted_ = false;

  /**
   * @type {Blockly.SvgHeader}
   * @private
   */
  this.header_ = new Blockly.SvgHeader(canvas, {
    headerText: this.textForCurrentState_(),
    onMouseDown: goog.bind(this.toggleCollapse, this),
    backgroundColor: DARK_GRAY_HEX
  });
  this.collapsed_ = false;
  this.showHeader_ = true;
};

Blockly.ContractEditorSectionView.prototype.textForCurrentState_ = function () {
  if (!this.onCollapseCallback_) {
    return this.headerText_;
  }

  var arrow = this.collapsed_ ?
    RIGHT_TRIANGLE_CHARACTER :
    DOWN_TRIANGLE_CHARACTER;
  return arrow + " " + this.headerText_;
};

/**
 * Mark this view as collapsed.
 * Will visually collapse during next placement.
 * @private
 */
Blockly.ContractEditorSectionView.prototype.toggleCollapse = function () {
  this.setCollapsed_(!this.collapsed_);
};

/**
 * Set the view
 * @param isCollapsed
 * @private
 */
Blockly.ContractEditorSectionView.prototype.setCollapsed_ = function (isCollapsed) {
  this.collapsed_ = isCollapsed;
  if (this.onCollapseCallback_) {
    this.onCollapseCallback_(this.collapsed_);
  }
  this.header_.setText(this.textForCurrentState_());
};

Blockly.ContractEditorSectionView.prototype.hideCompletely = function () {
  this.setCollapsed_(true);
  this.setHeaderVisible(false);
};

Blockly.ContractEditorSectionView.prototype.showHeaderAndExpand = function () {
  this.setCollapsed_(false);
  this.setHeaderVisible(true);
};

Blockly.ContractEditorSectionView.prototype.setHighlighted = function (highlighted) {
  this.highlighted_ = highlighted;
};

/**
 * Show or hide the header
 * @param showHeader
 * @private
 */
Blockly.ContractEditorSectionView.prototype.setHeaderVisible = function (showHeader) {
  this.showHeader_ = showHeader;
};

/**
 * Places the example header and block at the specified location,
 * returning an incremented Y coordinate
 * @param currentY
 * @param width
 * @returns {Number} the currentY to continue laying out at
 */
Blockly.ContractEditorSectionView.prototype.placeAndGetNewY = function (currentY, width) {
  var startY = currentY;

  this.header_.setVisible(this.showHeader_);

  if (this.showHeader_) {
    this.header_.setPositionSize(currentY, width, this.headerHeight);
    currentY += this.headerHeight;
  }

  if (!this.collapsed_) {
    currentY = this.placeAndGetNewYInnerSegment_(currentY);
  }

  if (this.highlighted_) {
    this.highlightBox_.setPositionSize(startY, width, currentY - startY);
  }

  return currentY;
};

Blockly.ContractEditorSectionView.prototype.placeAndGetNewYInnerSegment_ = function (currentY) {
    if (this.placeContentCallback) {
      currentY = this.placeContentCallback(currentY);
    }
    return currentY;
};
