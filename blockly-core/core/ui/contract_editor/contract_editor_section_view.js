'use strict';

goog.provide('Blockly.ContractEditorSectionView');

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
  this.headerHeight = opt_options.headerHeight ||
    Blockly.ContractEditorSectionView.DEFAULT_HEADER_HEIGHT;

  this.header = new Blockly.SvgHeader(canvas, {
    headerText: this.textForCurrentState_(),
    // onMouseDown: goog.bind(this.toggleCollapse_, this),
    backgroundColor: Blockly.ContractEditorSectionView.DARK_GRAY_HEX
  });
  this.collapsed_ = false;
};

Blockly.ContractEditorSectionView.DOWN_TRIANGLE_CHARACTER = '\u25BC'; // ▼
Blockly.ContractEditorSectionView.RIGHT_TRIANGLE_CHARACTER = '\u25B6'; // ▶
Blockly.ContractEditorSectionView.DARK_GRAY_HEX = '#898989';
Blockly.ContractEditorSectionView.DEFAULT_HEADER_HEIGHT = 50; //px

Blockly.ContractEditorSectionView.prototype.textForCurrentState_ = function () {
  if (!this.onCollapseCallback_) {
    return this.headerText_;
  }

  var arrow = this.collapsed_ ?
    Blockly.ContractEditorSectionView.RIGHT_TRIANGLE_CHARACTER :
    Blockly.ContractEditorSectionView.DOWN_TRIANGLE_CHARACTER;
  return arrow + " " + this.headerText_;
};

/**
 * Mark this view as collapsed.
 * Will visually collapse during next placement.
 * @private
 */
Blockly.ContractEditorSectionView.prototype.toggleCollapse_ = function () {
  this.collapsed_ = !this.collapsed_;
  if (this.onCollapseCallback_) {
    this.onCollapseCallback_(this.collapsed_);
  }
  this.header.setText(this.textForCurrentState_());
};

/**
 * Places the example header and block at the specified location,
 * returning an incremented Y coordinate
 * @param currentY
 * @param width
 * @returns {Number} the currentY to continue laying out at
 */
Blockly.ContractEditorSectionView.prototype.placeAndGetNewY = function (currentY, width) {
  this.header.setPositionSize(currentY, width, this.headerHeight);
  currentY += this.headerHeight;

  if (this.collapsed_) {
    return currentY;
  }

  if (this.placeContentCallback) {
    currentY += this.placeContentCallback(currentY);
  }

  return currentY;
};
