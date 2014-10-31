/**
 * @fileoverview Object representing a separate function editor. This function
 * editor provides a separate modal workspace where a user can modify a given
 * function definition.
 */
'use strict';

goog.provide('Blockly.FunctionEditor');

goog.require('Blockly.BlockSpace');
goog.require('Blockly.HorizontalFlyout');
goog.require('goog.style');
goog.require('goog.dom');
goog.require('goog.array');

/**
 * Class for a modal function editor.
 * @constructor
 */
Blockly.FunctionEditor = function() {
};

/**
 * Whether this editor has been initialized
 * @type {boolean}
 * @private
 */
Blockly.FunctionEditor.prototype.created_ = false;

/**
 * Current blocks in the editor's toolbox
 * @type {!Array.<!Blockly.Block>}
 */
Blockly.FunctionEditor.prototype.paramToolboxBlocks = [];

Blockly.FunctionEditor.prototype.openAndEditFunction = function(functionName) {
  this.functionDefinitionBlock = Blockly.mainBlockSpace.findFunction(functionName);
  if (!this.functionDefinitionBlock) {
    throw new Error("Can't find definition block to edit");
  }

  this.functionDefinitionBlock.setRenderBlockSpace(Blockly.modalBlockSpaceEditor.blockSpace);
  this.functionDefinitionBlock.moveTo(FRAME_MARGIN_SIDE, FRAME_MARGIN_TOP);
  this.functionDefinitionBlock.movable_ = false;

  goog.dom.getElement('functionNameText').value = functionName;

  this.show();
  this.refreshParamsToolbox();
};

Blockly.FunctionEditor.prototype.refreshParamsToolbox = function () {
  goog.array.clear(this.paramToolboxBlocks);
  var self = this;
  this.functionDefinitionBlock.getVars().forEach(function(varName){
    self.addParameter(varName);
  });
  this.refreshFlyoutParams_();
};

Blockly.FunctionEditor.prototype.openWithNewFunction = function () {
  this.ensureCreated_();

  // TODO(bjordan): override (add|remove)TopBlock to mirror mainBlockSpace one (for blocks instantiated in function editor)
  var newBlock = Blockly.Xml.domToBlock_(Blockly.mainBlockSpace,
    Blockly.createSvgElement('block', {type: 'procedures_defnoreturn'}));
  this.functionDefinitionBlock = newBlock;
  this.openAndEditFunction(this.functionDefinitionBlock.getTitleValue('NAME'));
};

Blockly.FunctionEditor.prototype.refreshFlyoutParams_ = function () {
  this.flyout_.hide();
  this.flyout_.show(this.paramToolboxBlocks);
};

Blockly.FunctionEditor.prototype.bindToolboxHandlers_ = function() {
  var paramAddText = goog.dom.getElement('paramAddText');
  var paramAddButton = goog.dom.getElement('paramAddButton');
  Blockly.bindEvent_(paramAddButton, 'mousedown', this, handleParamAdd);
  Blockly.bindEvent_(paramAddText, 'keydown', this, function(e) {
    if (e.keyCode == 13) {
      handleParamAdd.apply(this, arguments);
    }
  });
  function handleParamAdd() {
    var varName = paramAddText.value;
    paramAddText.value = '';
    this.addParameter(varName);
  }
};

Blockly.FunctionEditor.prototype.addParameter = function(newParameterName) {
  // Add the new param block to the local toolbox
  var param = Blockly.createSvgElement('block', {type: 'parameters_get'});
  var v = Blockly.createSvgElement('title', {name: 'VAR'}, param);
  v.innerHTML = newParameterName;
  this.paramToolboxBlocks.push(param);
  this.flyout_.hide();
  this.flyout_.show(this.paramToolboxBlocks);
  // Update the function definition
  this.functionDefinitionBlock.arguments_.push(newParameterName);
  this.functionDefinitionBlock.updateParams_();
};

Blockly.FunctionEditor.prototype.renameParameter = function(oldName, newName) {
  this.paramToolboxBlocks.forEach(function (block) {
    if (block.firstElementChild && block.firstElementChild.innerHTML === oldName) {
      block.firstElementChild.innerHTML = newName;
    }
  });
  this.refreshFlyoutParams_();
};

Blockly.FunctionEditor.prototype.removeParameter = function(oldName) {
  this.paramToolboxBlocks.forEach(function (block, n, arr) {
    if (block.firstElementChild && block.firstElementChild.innerHTML === oldName) {
      arr.splice(n, 1);
    }
  });
  this.flyout_.hide();
  this.flyout_.show(this.paramToolboxBlocks);
};

Blockly.FunctionEditor.prototype.show = function() {
  this.ensureCreated_();
  Blockly.activeWorkspace = Blockly.modalBlockSpaceEditor.blockSpace;
  goog.style.showElement(this.container_, true);
  goog.style.showElement(this.modalBackground_, true);
};

Blockly.FunctionEditor.prototype.ensureCreated_ = function() {
  if (!this.created_) {
    this.create_();
    this.created_ = true;
  }
};

Blockly.FunctionEditor.prototype.hide = function() {
  Blockly.activeWorkspace = Blockly.mainBlockSpace;
  this.functionDefinitionBlock.setRenderBlockSpace(Blockly.mainBlockSpace);
  Blockly.modalBlockSpaceEditor.blockSpace.removeTopBlock(this.functionDefinitionBlock);
  this.functionDefinitionBlock.setUserVisible(false);

  goog.style.showElement(this.container_, false);
  goog.style.showElement(this.modalBackground_, false);
};

Blockly.FunctionEditor.prototype.create_ = function() {
  if (this.created_) {
    throw "Attempting to re-create already created Function Editor";
  }

  this.container_ = document.createElement('div');
  this.container_.setAttribute('id', 'modalContainer');
  goog.dom.getElement('blockly').appendChild(this.container_);
  Blockly.modalBlockSpaceEditor = new Blockly.BlockSpaceEditor(this.container_, function() {
    var metrics = Blockly.mainBlockSpace.getMetrics();
    var contractDivHeight = Blockly.functionEditor.contractDiv_ ? Blockly.functionEditor.contractDiv_.getBoundingClientRect().height : 0;
    var topOffset = FRAME_MARGIN_TOP + Blockly.Bubble.BORDER_WIDTH + FRAME_HEADER_HEIGHT;
    metrics.absoluteLeft += FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH + 1;
    metrics.absoluteTop += topOffset + contractDivHeight;
    metrics.viewWidth -= (FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH) * 2;
    metrics.viewHeight -= FRAME_MARGIN_TOP + Blockly.Bubble.BORDER_WIDTH + topOffset;
    if (Blockly.functionEditor.flyout_) {
      metrics.absoluteTop += Blockly.functionEditor.flyout_.height_;
    }
    return metrics;
  });
  Blockly.modalWorkspace = Blockly.modalBlockSpaceEditor.blockSpace;

  // Add modal background and close button
  this.modalBackground_ = Blockly.createSvgElement('g', {'class': 'modalBackground'});
  Blockly.mainBlockSpaceEditor.svg_.appendChild(this.modalBackground_);
  this.closeButton_ = Blockly.createSvgElement('image', {
    'id': 'modalEditorClose',
    'width': 50,
    'height': 50,
    'y': -2
  });
  this.closeButton_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/blockly/media/common_images/x-button.png');
  Blockly.modalBlockSpaceEditor.svg_.appendChild(this.closeButton_);

  // Set up contract definition HTML section
  this.createContractDom_();

  // The function editor block space passes clicks through via
  // pointer-events:none, so register the unselect handler on lower elements
  Blockly.bindEvent_(goog.dom.getElement('modalContainer'), 'mousedown', null, function(e) {
    if (Blockly.selected && e.target === e.currentTarget) {
      Blockly.selected.unselect();
    }
  });

  Blockly.bindEvent_(goog.dom.getElement('modalEditorClose'), 'mousedown', this, this.hide);
  Blockly.bindEvent_(goog.dom.getElement('functionNameText'), 'input', this, functionNameChange);
  Blockly.bindEvent_(goog.dom.getElement('functionNameText'), 'keydown', this, functionNameChange); // IE9 doesn't fire oninput when delete key is pressed
  Blockly.bindEvent_(this.contractDiv_, 'mousedown', null, function() {
    if (Blockly.selected) {
      Blockly.selected.unselect();
    }
  });

  function functionNameChange(e) {
    this.functionDefinitionBlock.setTitleValue(e.target.value, 'NAME');
  }

  // Set up parameters toolbox
  this.flyout_ = new Blockly.HorizontalFlyout(Blockly.modalBlockSpaceEditor);
  var flyoutDom = this.flyout_.createDom();
  Blockly.modalWorkspace.svgGroup_.insertBefore(flyoutDom, Blockly.modalWorkspace.svgBlockCanvas_);
  this.flyout_.init(Blockly.modalWorkspace, false);
  this.bindToolboxHandlers_();

  var left = goog.dom.getElementByClass(Blockly.hasCategories ? 'blocklyToolboxDiv' : 'blocklyFlyoutBackground').getBoundingClientRect().width;
  var top = 0;
  this.frameBase_ = Blockly.createSvgElement('rect', {
    x: left + FRAME_MARGIN_SIDE,
    y: top + FRAME_MARGIN_TOP,
    fill: 'hsl(94, 73%, 35%)',
    // TODO: filter causes slow repaints while dragging blocks in Chrome 38
    // filter: 'url(#blocklyEmboss)',
    rx: Blockly.Bubble.BORDER_WIDTH,
    ry: Blockly.Bubble.BORDER_WIDTH
  }, this.modalBackground_);
  this.frameInner_ = Blockly.createSvgElement('rect', {
    x: left + FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH,
    y: top + FRAME_MARGIN_TOP + Blockly.Bubble.BORDER_WIDTH + FRAME_HEADER_HEIGHT,
    fill: '#ffffff'
  }, this.modalBackground_);
  this.frameText_ = Blockly.createSvgElement('text', {
    x: left + FRAME_MARGIN_SIDE + 16,
    y: top + FRAME_MARGIN_TOP + 22,
    'class': 'blocklyText',
    style: 'font-size: 12pt'
  }, this.modalBackground_);
  this.frameText_.appendChild(document.createTextNode(Blockly.Msg.FUNCTION_HEADER));
  this.position_();

  this.onResizeWrapper_ = Blockly.bindEvent_(window,
      goog.events.EventType.RESIZE, this, this.position_);

  Blockly.modalBlockSpaceEditor.svgResize();
};

Blockly.FunctionEditor.prototype.destroy_ = function() {
  // TODO(bjordan/jlory): needed? when to call?
  delete Blockly.modalWorkspace;
  this.modalBackground_ = null;
  if (this.onResizeWrapper_) {
    Blockly.unbindEvent_(this.onResizeWrapper_);
    this.onResizeWrapper_ = null;
  }
};

Blockly.FunctionEditor.prototype.position_ = function() {
  var metrics = Blockly.modalWorkspace.getMetrics();
  var width = metrics.viewWidth;
  var height = metrics.viewHeight;
  if (!Blockly.hasCategories) {
    width -= goog.dom.getElementByClass('blocklyFlyoutBackground').getBoundingClientRect().width;
  }
  this.frameBase_.setAttribute('width', width + 2 * Blockly.Bubble.BORDER_WIDTH);
  this.frameBase_.setAttribute('height', height + 2 * Blockly.Bubble.BORDER_WIDTH + FRAME_HEADER_HEIGHT);
  this.frameInner_.setAttribute('width', width);
  this.frameInner_.setAttribute('height', height);
  if (Blockly.RTL) {
    // TODO: Fix RTL
    this.frameBase_.setAttribute('x', -width + FRAME_MARGIN_SIDE);
    this.frameInner_.setAttribute('x', -width + FRAME_MARGIN_SIDE);
    this.frameText_.setAttribute('x', -width + 2 * FRAME_MARGIN_SIDE);
  }

  // Resize contract div width
  this.contractDiv_.style.width = metrics.viewWidth + 'px';

  // Move the close button
  this.closeButton_.setAttribute('x', metrics.absoluteLeft + metrics.viewWidth - 30 + 'px');

  // Move workspace to account for horizontal flyout height
  Blockly.modalBlockSpaceEditor.svgResize();
};

Blockly.FunctionEditor.prototype.createContractDom_ = function() {
  this.contractDiv_ = goog.dom.createDom('div', 'blocklyToolboxDiv paramToolbox blocklyText');
  this.container_.insertBefore(this.contractDiv_, this.container_.firstChild);
  this.contractDiv_.innerHTML = '<div>Name your function:</div>'
      + '<div><input id="functionNameText" type="text"></div>'
      + '<div>What is your function supposed to do?</div>'
      + '<div><textarea rows="2"></textarea></div>'
      + '<div>What parameters does your function take?</div>'
      + '<div><input id="paramAddText" type="text" style="width: 200px;"> <button id="paramAddButton" class="btn">Add Parameter</button>';
  var metrics = Blockly.modalWorkspace.getMetrics();
  this.contractDiv_.style.left = metrics.absoluteLeft + 'px';
  this.contractDiv_.style.top = metrics.absoluteTop + 'px';
  this.contractDiv_.style.width = metrics.viewWidth + 'px';
  this.contractDiv_.style.display = 'block';
};

Blockly.functionEditor = new Blockly.FunctionEditor();
