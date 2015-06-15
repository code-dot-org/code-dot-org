'use strict';

goog.provide('Blockly.ExampleView');

/**
 * Handles laying out an example block with a test button
 * @constructor
 * @param {SVGElement} canvas
 * @param {Object} opt_options
 */
Blockly.ExampleView = function (dom, svg) {
  this.domParent_ = dom;
  this.svgParent_ = svg;

  this.horizontalLine = Blockly.createSvgElement('rect', {
    'fill': '#000',
    'height': 2.0
  }, this.svgParent_);
  this.grayBackdrop = Blockly.createSvgElement('rect', {
    'fill': '#DDD'
  }, this.svgParent_, {'belowExisting': true});
  this.testExampleButton = goog.dom.createDom('button', 'testButton launch');
  this.testExampleButton.innerHTML = "Test";
  Blockly.bindEvent_(this.testExampleButton, 'click', this, this.runExample_);
  goog.dom.append(this.domParent_, this.testExampleButton);

  this.resultText = goog.dom.createDom('div', 'example-result-text');
  this.resultText.innerHTML = "Result: not ran yet";
  goog.dom.append(this.domParent_, this.resultText);
};

Blockly.ExampleView.prototype.runExample_ = function () {
  console.log("Running example");
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
  var newY = currentY;

  var commonMargin = marginBelow / 2;
  newY += commonMargin;

  var input = block.getInput(Blockly.ContractEditor.EXAMPLE_BLOCK_ACTUAL_INPUT_NAME);
  if (input.type == Blockly.FUNCTIONAL_INPUT) {
    var width = 40; // TODO(bjordan): actually calculate empty input
    var functionCallBlock = block.getInputTargetBlock(
      Blockly.ContractEditor.EXAMPLE_BLOCK_ACTUAL_INPUT_NAME);
    if (functionCallBlock) {
      width = functionCallBlock.getHeightWidth().width;
    }
    input.extraSpace = maxWidth - width;
  }

  block.moveTo(marginLeft, newY);
  newY += block.getHeightWidth().height;

  newY += commonMargin;

  this.testExampleButton.style.top = newY + 'px';
  var exampleButtonX = midLineX + commonMargin;
  this.testExampleButton.style.left = exampleButtonX + 'px';

  this.resultText.style.top = newY + 'px';
  var exampleButtonRight = exampleButtonX + this.testExampleButton.offsetWidth;
  this.resultText.style.left = commonMargin + exampleButtonRight + 'px';

  newY += this.testExampleButton.offsetHeight;

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
  goog.dom.removeNode(this.resultText);
};
