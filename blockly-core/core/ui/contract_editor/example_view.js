'use strict';

goog.provide('Blockly.ExampleView');

// TODO (brent) - change this text
/** @const */ var NO_RESULT_TEXT = "Test result: not ran yet.";

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
  this.grayBackdrop = Blockly.createSvgElement('rect', {
    'fill': '#DDD'
  }, this.svgParent_, {'belowExisting': true});

  this.testExampleButton = this.initializeTestButton_("Test", "run26",
    this.testExample_.bind(this));
  this.resetExampleButton = this.initializeTestButton_("Reset", "reset26",
    this.reset.bind(this));
  goog.dom.classes.add(this.resetExampleButton, 'resetButton');
  goog.dom.append(this.domParent_, this.testExampleButton);
  goog.dom.append(this.domParent_, this.resetExampleButton);
  this.refreshButtons();
  this.resultText = goog.dom.createDom('div', 'example-result-text');
  this.resultText.innerHTML = NO_RESULT_TEXT;
  goog.dom.append(this.domParent_, this.resultText);
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
}

/**
 * Performs the test for this example, setting the result text appropriately.
 */
Blockly.ExampleView.prototype.testExample_ = function () {
  // TODO  (brent)- only reset examples that current have a reset button?
  this.contractEditor_.resetExampleViews();

  this.setResult(this.contractEditor_.testExample(this.block_));
  this.refreshButtons(true);

  // TODO(bjordan): UI re-layout post-result?
};

/**
 * Reset to a non-running state, clearing our result text.
 */
Blockly.ExampleView.prototype.reset = function () {
  this.contractEditor_.resetExample(this.block_);
  this.setResult(NO_RESULT_TEXT);
  this.refreshButtons(false);
};

Blockly.ExampleView.prototype.setResult = function (result) {
  this.resultText.innerHTML = result;
  this.refreshButtons(false);
};

/**
 * @param {boolean} active Is this example currently displayed in the play area.
 */
Blockly.ExampleView.prototype.refreshButtons = function (active) {
  goog.style.showElement(this.testExampleButton, !active);
  goog.style.showElement(this.resetExampleButton, active);
};

/**
 * Places the example at the specified location,
 * returning an incremented Y coordinate
 * @param block
 * @param currentY
 * @param maxWidth
 * @param marginLeft
 * @param marginBelow
 * @returns {number} the y coordinate to continue laying out at
 */
Blockly.ExampleView.prototype.placeExampleAndGetNewY = function (
    block, currentY, maxWidth, marginLeft, marginBelow, fullWidth, midLineX) {
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
    input.extraSpace = maxWidth - width;
    if (input.extraSpace !== originalExtraSpace) {
      block.getSvgRenderer().render(true);
    }
  }

  block.moveTo(marginLeft, newY);

  newY += block.getHeightWidth().height;

  newY += commonMargin;

  var exampleButtonX = midLineX + commonMargin;
  [this.testExampleButton, this.resetExampleButton].forEach(function (button) {
    button.style.top = newY + 'px';
    button.style.left = exampleButtonX + 'px';
  });

  // Only test or reset will be visible
  var buttonWidth = Math.max(this.resetExampleButton.offsetWidth,
    this.testExampleButton.offsetWidth);
  var buttonHeight = Math.max(this.resetExampleButton.offsetHeight,
    this.testExampleButton.offsetHeight);

  this.resultText.style.top = (newY + 14) + 'px';
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
