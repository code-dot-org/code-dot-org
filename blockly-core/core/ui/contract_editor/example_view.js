'use strict';

goog.provide('Blockly.ExampleView');

/** @const */ var NO_RESULT_TEXT = "";
/** @const */ var RESULT_TEXT_TOP_MARGIN = 14;

/**
 * Handles laying out an example block with a test button
 * @constructor
 * @param {Element} dom
 * @param {SVGElement} svg
 * @param {Blockly.ContractEditor} contractEditor
 */
Blockly.ExampleView = function (dom, svg, contractEditor) {
  this.domParent_ = dom;
  this.svgParent_ = svg;
  this.contractEditor_ = contractEditor;
  this.block_ = null;

  this.horizontalLine = Blockly.createSvgElement('rect', {
    'fill': '#000',
    'height': 2.0
  }, this.svgParent_);
  Blockly.svgIgnoreMouseEvents(this.horizontalLine);

  this.grayBackdrop = Blockly.createSvgElement('rect', {
    'fill': '#DDD'
  }, this.svgParent_, {'belowExisting': true});
  this.grayBackdrop.style.pointerEvents = 'none';
  Blockly.svgIgnoreMouseEvents(this.grayBackdrop);

  this.testExampleButton = this.initializeTestButton_("Test", "run26",
    this.testExample_.bind(this));
  this.resetExampleButton = this.initializeTestButton_("Reset", "reset26",
    this.reset.bind(this));
  goog.dom.classes.add(this.resetExampleButton, 'resetButton');
  goog.dom.append(this.domParent_, this.testExampleButton);
  goog.dom.append(this.domParent_, this.resetExampleButton);
  this.resultText = goog.dom.createDom('div', 'example-result-text');
  Blockly.svgIgnoreMouseEvents(this.resultText);
  this.resultText.innerHTML = NO_RESULT_TEXT;
  goog.dom.append(this.domParent_, this.resultText);
  this.refreshTestingUI(false);
};

/**
 * Create/configure our test/reset buttons.
 */
Blockly.ExampleView.prototype.initializeTestButton_ = function (buttonText,
    iconClass, callback) {
  var newButton = goog.dom.createDom('button',
    'testButton launch blocklyLaunch exampleAreaButton');
  var testText = goog.dom.createDom('div');
  testText.innerHTML = buttonText;
  var runImage = goog.dom.createDom('img', iconClass);
  runImage.setAttribute('src', Blockly.assetUrl('media/1x1.gif'));
  goog.dom.append(newButton, runImage);
  goog.dom.append(newButton, testText);
  Blockly.bindEvent_(newButton, 'click', null, callback);
  return newButton;
};

/**
 * @param {Blockly.Block} block
 * @returns {boolean} True if the provided example block is the one that we're
 *   the view for.
 */
Blockly.ExampleView.prototype.isViewForBlock = function (block) {
  return this.block_ === block;
};

/**
 * Performs the test for this example, setting the result text appropriately.
 */
Blockly.ExampleView.prototype.testExample_ = function () {
  this.contractEditor_.resetExampleViews();

  var result = this.contractEditor_.testExample(this.block_);
  this.setResult(result);
  this.refreshTestingUI(true);

  // TODO(bjordan): UI re-layout post-result?
};

/**
 * Reset to a non-running state, clearing our result text.
 */
Blockly.ExampleView.prototype.reset = function () {
  // If reset button isn't visible, don't change anything, thus keeping around
  // old result text
  if (goog.style.isElementShown(this.resetExampleButton)) {
    this.contractEditor_.resetExample(this.block_);
    this.setResult(NO_RESULT_TEXT);
    this.refreshTestingUI(false);
  }
};

Blockly.ExampleView.prototype.setResult = function (result) {
  this.resultText.innerHTML = result;
  this.refreshTestingUI(false);
};

/**
 * @param {boolean} active Is this example's result currently visualized
 */
Blockly.ExampleView.prototype.refreshTestingUI = function (active) {
  goog.style.setElementShown(this.resultText, Blockly.showExampleTestButtons);
  goog.style.setElementShown(this.testExampleButton,
      Blockly.showExampleTestButtons && !active);
  goog.style.setElementShown(this.resetExampleButton,
      Blockly.showExampleTestButtons && active);
};

/**
 * Places the example at the specified location, returning an incremented Y
 * coordinate.
 * @param block
 * @param {number} currentY - Y coordinate to start at, relative to svgParent
 * @param {number} exampleMaxInputWidth - max width of example call blocks
 * @param {number} marginLeft
 * @param {number} marginBelow
 * @param {number} fullWidth - full width of layout area
 * @param {number} midLineX - midline location
 * @param {number} exampleDivTop - top of our DOM parent relative to SVG parent
 * @returns {number} the y coordinate to continue laying out at
 */
Blockly.ExampleView.prototype.placeExampleAndGetNewY = function (
    block, currentY, exampleMaxInputWidth, marginLeft, marginBelow, fullWidth,
    midLineX, exampleDivTop) {
  this.block_ = block;
  var newY = currentY;

  var commonMargin = marginBelow / 2;
  newY += commonMargin;

  var input = block.getInput(Blockly.ContractEditor.EXAMPLE_BLOCK_ACTUAL_INPUT_NAME);
  if (input.type == Blockly.FUNCTIONAL_INPUT) {
    var originalExtraSpace = input.extraSpace;
    var width = 40; // TODO(bjordan): actually calculate empty input
    var functionCallBlock = block.getInputTargetBlock(
      Blockly.ContractEditor.EXAMPLE_BLOCK_ACTUAL_INPUT_NAME);
    if (functionCallBlock) {
      width = functionCallBlock.getHeightWidth().width;
    }
    input.extraSpace = exampleMaxInputWidth - width;
    if (input.extraSpace !== originalExtraSpace) {
      block.getSvgRenderer().render(true);
    }
  }

  block.moveTo(marginLeft, newY);

  newY += block.getHeightWidth().height;

  newY += commonMargin;

  var exampleButtonX = midLineX + commonMargin;
  [this.testExampleButton, this.resetExampleButton].forEach(function (button) {
    button.style.top = newY - exampleDivTop + 'px';
    button.style.left = exampleButtonX + 'px';
  });

  // Only test or reset will be visible
  var buttonWidth = Math.max(this.resetExampleButton.offsetWidth,
    this.testExampleButton.offsetWidth);
  var buttonHeight = Math.max(this.resetExampleButton.offsetHeight,
    this.testExampleButton.offsetHeight);

  this.resultText.style.top = (newY + RESULT_TEXT_TOP_MARGIN - exampleDivTop)
      + 'px';
  var exampleButtonRight = exampleButtonX + buttonWidth;
  this.resultText.style.left = commonMargin + exampleButtonRight + 'px';

  newY += buttonHeight;

  newY += commonMargin;

  this.horizontalLine.setAttribute('transform', 'translate(' + 0 + ',' + newY + ')');
  this.horizontalLine.setAttribute('width', fullWidth);

  this.grayBackdrop.setAttribute('transform', 'translate('+ 0 +','+ currentY +')');
  this.grayBackdrop.setAttribute('width', midLineX);
  this.grayBackdrop.setAttribute('height', newY - currentY);

  return newY;
};


Blockly.ExampleView.prototype.dispose = function () {
  goog.dom.removeNode(this.horizontalLine);
  goog.dom.removeNode(this.grayBackdrop);
  goog.dom.removeNode(this.testExampleButton);
  goog.dom.removeNode(this.resetExampleButton);
  goog.dom.removeNode(this.resultText);
};
