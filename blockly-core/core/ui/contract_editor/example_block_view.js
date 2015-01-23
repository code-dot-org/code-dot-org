'use strict';

goog.provide('Blockly.ExampleBlockView');

/**
 * Header with a block below it
 * @param {!Blockly.Block} block
 * @param {!Number} exampleIndex
 * @param {!Function} onCollapseCallback
 * @constructor
 */
Blockly.ExampleBlockView = function (block, exampleIndex, onCollapseCallback) {
  this.block = block;
  this.exampleNumber = Blockly.ExampleBlockView.START_EXAMPLE_COUNT_AT + exampleIndex;
  this.header = new Blockly.SvgHeader(block.blockSpace.svgBlockCanvas_, {
    headerText: this.textForCurrentState_(),
    onMouseDown: this.toggleCollapse_,
    onMouseDownContext: this
  });
  this.collapsed_ = false;
  this.onCollapseCallback_ = onCollapseCallback;
};

Blockly.ExampleBlockView.START_EXAMPLE_COUNT_AT = 1;
Blockly.ExampleBlockView.DOWN_TRIANGLE_CHARACTER = '\u25BC'; // ▼
Blockly.ExampleBlockView.RIGHT_TRIANGLE_CHARACTER = '\u25B6'; // ▶

Blockly.ExampleBlockView.prototype.textForCurrentState_ = function () {
  var arrow = this.collapsed_ ?
    Blockly.ExampleBlockView.RIGHT_TRIANGLE_CHARACTER :
    Blockly.ExampleBlockView.DOWN_TRIANGLE_CHARACTER;
  return arrow + " " + Blockly.Msg.EXAMPLE + " " + this.exampleNumber;
};

/**
 * Mark this view as collapsed.
 * Will visually collapse during next placement.
 * @private
 */
Blockly.ExampleBlockView.prototype.toggleCollapse_ = function () {
  this.collapsed_ = !this.collapsed_;
  this.block.setUserVisible(!this.collapsed_);
  this.onCollapseCallback_();
  this.header.setText(this.textForCurrentState_());
};

/**
 * Places the example header and block at the specified location,
 * returning an incremented Y coordinate
 * @param currentX
 * @param currentY
 * @param width
 * @param headerHeight
 * @returns {Number} the currentY to continue laying out at
 */
Blockly.ExampleBlockView.prototype.placeStartingAt = function (currentX, currentY, width, headerHeight) {
  this.header.setPositionSize(currentY, width, headerHeight);
  currentY += headerHeight;

  if (this.collapsed_) {
    return currentY;
  }

  currentY += FRAME_MARGIN_TOP;
  this.block.moveTo(currentX, currentY);
  currentY += this.block.getHeightWidth().height;
  currentY += FRAME_MARGIN_TOP;
  return currentY;
};
