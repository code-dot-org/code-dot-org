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
goog.require('goog.events');

/**
 * Class for a modal function editor.
 * @constructor
 */
Blockly.FunctionEditor = function() {
  /**
   * Whether this editor has been initialized
   * @type {boolean}
   * @private
   */
  this.created_ = false;

  /**
   * Current blocks in the editor's parameter toolbox
   * @type {!Array.<!Blockly.Block>}
   */
  this.paramToolboxBlocks_ = [];

  /**
   * Current block being edited
   * @type {?Blockly.Block}
   */
  this.functionDefinitionBlock = null;

  /**
   * Enclosing container div for the function editor, shown and hidden as
   * editor is toggled.
   * Note: visibility is used as indicator of modal open state.
   * @type {?Element}
   * @private
   */
  this.container_ = null;

  this.closeButton_ = null;
  this.contractDiv_ = null;
  this.flyout_ = null;
  this.frameBase_ = null;
  this.frameInner_ = null;
  this.frameText_ = null;
  this.modalBackground_ = null;
  this.onResizeWrapper_ = null;
};

Blockly.FunctionEditor.prototype.openAndEditFunction = function(functionName) {
  var targetFunctionDefinitionBlock = Blockly.mainBlockSpace.findFunction(functionName);
  if (!targetFunctionDefinitionBlock) {
    throw new Error("Can't find definition block to edit");
  }

  this.show();

  var dom = Blockly.Xml.blockToDom_(targetFunctionDefinitionBlock);
  targetFunctionDefinitionBlock.dispose(false, false, true);
  this.functionDefinitionBlock = Blockly.Xml.domToBlock_(Blockly.modalBlockSpace, dom);
  this.functionDefinitionBlock.moveTo(Blockly.RTL
      ? Blockly.modalBlockSpace.getMetrics().viewWidth - FRAME_MARGIN_SIDE
      : FRAME_MARGIN_SIDE, FRAME_MARGIN_TOP);
  this.functionDefinitionBlock.setMovable(false);
  this.functionDefinitionBlock.setUserVisible(true);
  this.populateParamToolbox_();

  goog.dom.getElement('functionNameText').value = functionName;
  goog.dom.getElement('functionDescriptionText').value = this.functionDefinitionBlock.description_ || '';
};

Blockly.FunctionEditor.prototype.populateParamToolbox_ = function () {
  this.paramToolboxBlocks_ = [];
  var self = this;
  this.functionDefinitionBlock.getVars().forEach(function(varName){
    self.addParameter(varName);
  });
  this.refreshParamsEverywhere();
};

Blockly.FunctionEditor.prototype.openWithNewFunction = function () {
  this.ensureCreated_();

  this.functionDefinitionBlock = Blockly.Xml.domToBlock_(Blockly.mainBlockSpace,
    Blockly.createSvgElement('block', {type: 'procedures_defnoreturn'}));
  this.openAndEditFunction(this.functionDefinitionBlock.getTitleValue('NAME'));
};

Blockly.FunctionEditor.prototype.bindToolboxHandlers_ = function() {
  var paramAddTextElement = goog.dom.getElement('paramAddText');
  var paramAddButton = goog.dom.getElement('paramAddButton');
  Blockly.bindEvent_(paramAddButton, 'mousedown', this, goog.bind(this.addParamFromInputField_, this, paramAddTextElement));
  Blockly.bindEvent_(paramAddTextElement, 'keydown', this, function(e) {
    if (e.keyCode === goog.events.KeyCodes.ENTER) {
      this.addParamFromInputField_(paramAddTextElement);
    }
  });
};

Blockly.FunctionEditor.prototype.addParamFromInputField_ = function(parameterTextElement) {
  var newParamName = parameterTextElement.value;
  parameterTextElement.value = '';
  this.addParameter(newParamName);
  this.refreshParamsEverywhere();
};

Blockly.FunctionEditor.prototype.addParameter = function(newParameterName) {
  // Add the new param block to the local toolbox
  var param = Blockly.createSvgElement('block', {type: 'parameters_get'});
  var v = Blockly.createSvgElement('title', {name: 'VAR'}, param);
  v.textContent = newParameterName;
  this.paramToolboxBlocks_.push(param);
};

Blockly.FunctionEditor.prototype.renameParameter = function(oldName, newName) {
  this.paramToolboxBlocks_.forEach(function (block) {
    if (block.firstElementChild && block.firstElementChild.textContent === oldName) {
      block.firstElementChild.textContent = newName;
    }
  });
};

/**
 * Remove procedure parameter from the toolbox and everywhere it is used
 * @param {String} nameToRemove
 */
Blockly.FunctionEditor.prototype.removeParameter = function(nameToRemove) {
  goog.array.removeIf(this.paramToolboxBlocks_, function (block) {
    return block.firstElementChild && block.firstElementChild.textContent === nameToRemove;
  });
  this.refreshParamsEverywhere();
};

Blockly.FunctionEditor.prototype.refreshParamsEverywhere = function() {
  this.refreshParamsInFlyout_();
  this.refreshParamsOnFunction_();
};

Blockly.FunctionEditor.prototype.refreshParamsInFlyout_ = function () {
  this.flyout_.hide();
  this.flyout_.show(this.paramToolboxBlocks_);
};

Blockly.FunctionEditor.prototype.refreshParamsOnFunction_ = function() {
  var paramNames = [];
  var paramIDs = [];
  goog.array.forEach(this.paramToolboxBlocks_, function(blockXML, index) {
    paramNames.push(blockXML.firstElementChild.textContent);
    paramIDs.push(index);
  }, this);
  this.functionDefinitionBlock.updateParamsFromArrays(paramNames, paramIDs);
};

Blockly.FunctionEditor.prototype.show = function() {
  this.ensureCreated_();
  goog.style.showElement(this.container_, true);
  goog.style.showElement(this.modalBackground_, true);
};

/**
 * Is the function editor currently open?
 */
Blockly.FunctionEditor.prototype.isOpen = function() {
  return this.isCreated() && goog.style.isElementShown(this.container_);
};

Blockly.FunctionEditor.prototype.isCreated = function() {
  return !!this.container_;
};

Blockly.FunctionEditor.prototype.ensureCreated_ = function() {
  if (!this.isCreated()) {
    this.create_();
  }
};

Blockly.FunctionEditor.prototype.hide = function() {
  this.functionDefinitionBlock.setUserVisible(false);
  this.functionDefinitionBlock.setMovable(true);
  var dom = Blockly.Xml.blockToDom_(this.functionDefinitionBlock);
  this.functionDefinitionBlock.dispose(false, false, true);
  Blockly.Xml.domToBlock_(Blockly.mainBlockSpace, dom);

  goog.style.showElement(this.container_, false);
  goog.style.showElement(this.modalBackground_, false);

  goog.dom.getElement('functionNameText').value = '';
  goog.dom.getElement('functionDescriptionText').value = '';
  goog.dom.getElement('paramAddText').value = '';

  Blockly.modalBlockSpace.clear();
};

Blockly.FunctionEditor.prototype.create_ = function() {
  if (this.created_) {
    throw "Attempting to re-create already created Function Editor";
  }

  this.container_ = document.createElement('div');
  this.container_.setAttribute('id', 'modalContainer');
  goog.dom.getElement('blockly').appendChild(this.container_);
  Blockly.modalBlockSpaceEditor = new Blockly.BlockSpaceEditor(this.container_, function() {
    // Define a special getMetrics function for our block space editor
    var metrics = Blockly.mainBlockSpace.getMetrics();
    var contractDivHeight = Blockly.functionEditor.contractDiv_ ? Blockly.functionEditor.contractDiv_.getBoundingClientRect().height : 0;
    var topOffset = FRAME_MARGIN_TOP + Blockly.Bubble.BORDER_WIDTH + FRAME_HEADER_HEIGHT;
    metrics.absoluteLeft += FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH + 1;
    metrics.absoluteTop += topOffset + contractDivHeight;
    metrics.viewWidth -= (FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH) * 2;
    metrics.viewHeight -= FRAME_MARGIN_TOP + Blockly.Bubble.BORDER_WIDTH + topOffset;
    if (Blockly.functionEditor.flyout_) {
      metrics.absoluteTop += Blockly.functionEditor.flyout_.getHeight();
    }
    return metrics;
  });
  Blockly.modalBlockSpace = Blockly.modalBlockSpaceEditor.blockSpace;

  Blockly.modalBlockSpaceEditor.addChangeListener(Blockly.mainBlockSpace.fireChangeEvent);

  // Add modal background and close button
  this.modalBackground_ = Blockly.createSvgElement('g', {'class': 'modalBackground'});
  Blockly.mainBlockSpaceEditor.appendSVGChild(this.modalBackground_);
  this.closeButton_ = Blockly.createSvgElement('image', {
    'id': 'modalEditorClose',
    'width': 50,
    'height': 50,
    'y': -2
  });
  this.closeButton_.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/blockly/media/common_images/x-button.png');
  Blockly.modalBlockSpaceEditor.appendSVGChild(this.closeButton_);

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
  function functionNameChange(e) {
    this.functionDefinitionBlock.setTitleValue(e.target.value, 'NAME');
  }

  Blockly.bindEvent_(this.contractDiv_, 'mousedown', null, function() {
    if (Blockly.selected) {
      Blockly.selected.unselect();
    }
  });

  Blockly.bindEvent_(goog.dom.getElement('functionDescriptionText'), 'input', this, functionDescriptionChange);
  Blockly.bindEvent_(goog.dom.getElement('functionDescriptionText'), 'keydown', this, functionDescriptionChange); // IE9 doesn't fire oninput when delete key is pressed
  function functionDescriptionChange(e) {
    this.functionDefinitionBlock.description_ = e.target.value;
  }

  // Set up parameters toolbox
  this.flyout_ = new Blockly.HorizontalFlyout(Blockly.modalBlockSpaceEditor);
  var flyoutDom = this.flyout_.createDom();
  Blockly.modalBlockSpace.svgGroup_.insertBefore(flyoutDom, Blockly.modalBlockSpace.svgBlockCanvas_);
  this.flyout_.init(Blockly.modalBlockSpace, false);
  this.bindToolboxHandlers_();

  var left = goog.dom.getElementByClass(Blockly.hasCategories ? 'blocklyToolboxDiv' : 'blocklyFlyoutBackground').getBoundingClientRect().width;
  var top = 0;
  this.frameBase_ = Blockly.createSvgElement('rect', {
    x: left + FRAME_MARGIN_SIDE,
    y: top + FRAME_MARGIN_TOP,
    fill: 'hsl(94, 73%, 35%)',
    // TODO(jlory): filter causes slow repaints while dragging blocks in Chrome 38
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

Blockly.FunctionEditor.prototype.position_ = function() {
  var metrics = Blockly.modalBlockSpace.getMetrics();
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
    this.frameBase_.setAttribute('x', FRAME_MARGIN_SIDE);
    this.frameInner_.setAttribute('x', FRAME_MARGIN_SIDE + Blockly.Bubble.BORDER_WIDTH + 1);
    this.frameText_.setAttribute('x', width - 2 * FRAME_MARGIN_SIDE);
  }

  // Resize contract div width
  this.contractDiv_.style.width = metrics.viewWidth + 'px';

  // Move the close button
  this.closeButton_.setAttribute('x',
      Blockly.RTL ? 2 : metrics.absoluteLeft + metrics.viewWidth - 30 + 'px');

  // Move workspace to account for horizontal flyout height
  Blockly.modalBlockSpaceEditor.svgResize();
};

Blockly.FunctionEditor.prototype.createContractDom_ = function() {
  this.contractDiv_ = goog.dom.createDom('div', 'blocklyToolboxDiv paramToolbox blocklyText');
  if (Blockly.RTL) {
    this.contractDiv_.setAttribute('dir', 'RTL');
  }
  this.contractDiv_.innerHTML = '<div>Name your function:</div>'
      + '<div><input id="functionNameText" type="text"></div>'
      + '<div>What is your function supposed to do?</div>'
      + '<div><textarea id="functionDescriptionText" rows="2"></textarea></div>'
      + '<div>What parameters does your function take?</div>'
      + '<div><input id="paramAddText" type="text" style="width: 200px;"> '
      + '<button id="paramAddButton" class="btn">Add Parameter</button>';
  var metrics = Blockly.modalBlockSpace.getMetrics();
  this.contractDiv_.style.left = metrics.absoluteLeft + 'px';
  this.contractDiv_.style.top = metrics.absoluteTop + 'px';
  this.contractDiv_.style.width = metrics.viewWidth + 'px';
  this.contractDiv_.style.display = 'block';
  this.container_.insertBefore(this.contractDiv_, this.container_.firstChild);
};
