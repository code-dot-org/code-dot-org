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

  this.testRunning_ = false;

  this.horizontalLine = Blockly.createSvgElement('rect', {
    'fill': '#000',
    'height': 2.0
  }, this.svgParent_);
  this.grayBackdrop = Blockly.createSvgElement('rect', {
    'fill': '#DDD'
  }, this.svgParent_, {'belowExisting': true});
  //<button id="runButton" class="launch blocklyLaunch <%= hideRunButton ? 'invisible' : ''%>">
  //  <div><%= msg.runProgram() %></div>
  //  <img src="<%= assetUrl('media/1x1.gif') %>" class="run26"/>
  //  </button>
  //<button id="resetButton" class="launch blocklyLaunch" style="display: none">
  //  <div><%= msg.resetProgram() %></div>
  //  <img src="<%= assetUrl('media/1x1.gif') %>" class="reset26"/>
  //</button>
  this.testExampleButton = this.initializeTestButton("Test", "run26", this.testExample_.bind(this));
  this.resetExampleButton = this.initializeTestButton("Reset", "reset26", this.resetExample_.bind(this));
  goog.dom.append(this.domParent_, this.testExampleButton);
  goog.dom.append(this.domParent_, this.resetExampleButton);
  this.refreshButtons();
  this.resultText = goog.dom.createDom('div', 'example-result-text');
  this.resultText.innerHTML = "Result: not ran yet";
  goog.dom.append(this.domParent_, this.resultText);
};

Blockly.ExampleView.prototype.initializeTestButton = function (buttonText, iconClass, callback) {
  var newButton = goog.dom.createDom('button', 'testButton launch blocklyLaunch exampleAreaButton');
  var testText = goog.dom.createDom('div');
  testText.innerHTML = buttonText;
  var runImage = goog.dom.createDom('img', iconClass);
  runImage.setAttribute('src', Blockly.assetUrl('media/1x1.gif'));
  goog.dom.append(newButton, runImage);
  goog.dom.append(newButton, testText);
  Blockly.bindEvent_(newButton, 'click', null, callback);
  return newButton;
};

Blockly.ExampleView.prototype.testExample_ = function () {
  this.testRunning_ = true;
  this.refreshButtons();
  // TODO(bjordan): UI re-layout post-result?
};

Blockly.ExampleView.prototype.resetExample_ = function () {
  this.testRunning_ = false;
  this.refreshButtons();
};

Blockly.ExampleView.prototype.getVisibleButton_ = function () {
  return this.testRunning_ ? this.resetExampleButton : this.testExampleButton;
};

Blockly.ExampleView.prototype.refreshButtons = function () {
  goog.style.showElement(this.testExampleButton, !this.testRunning_);
  goog.style.showElement(this.resetExampleButton, this.testRunning_);
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

  var exampleButtonX = midLineX + commonMargin;
  [this.testExampleButton, this.resetExampleButton].forEach(function (button) {
    button.style.top = newY + 'px';
    button.style.left = exampleButtonX + 'px';
  });

  var visibleTestButton = this.getVisibleButton_();
  this.resultText.style.top = newY + 'px';
  var exampleButtonRight = exampleButtonX + visibleTestButton.offsetWidth;
  this.resultText.style.left = commonMargin + exampleButtonRight + 'px';

  newY += visibleTestButton.offsetHeight;

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
