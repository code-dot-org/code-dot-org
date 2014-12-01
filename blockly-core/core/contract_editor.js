/**
 * @fileoverview Object representing a separate function editor. This function
 * editor provides a separate modal workspace where a user can modify a given
 * function definition.
 */
'use strict';

goog.provide('Blockly.ContractEditor');

goog.require('Blockly.FunctionEditor');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.FlatMenuButtonRenderer');
goog.require('goog.ui.Option');
goog.require('goog.ui.Select');
goog.require('goog.ui.Separator');
goog.require('goog.ui.decorate');
goog.require('goog.ui.Component.EventType');
goog.require('goog.events');

/**
 * A horizontal SVG bar with rectangular background and text
 * @param parent {!Element}
 * @param headerText {!String}
 * @constructor
 */
Blockly.SVGHeader = function(parent, headerText) {
  this.padding = { left: 10 };
  this.svgGroup_ = Blockly.createSvgElement('g', {}, parent);
  this.grayRectangleElement_ = Blockly.createSvgElement('rect', { 'fill': '#dddddd' }, this.svgGroup_);
  this.textElement_ = Blockly.createSvgElement('text', {
    'class': 'blackBlocklyText'
  }, this.svgGroup_);
  this.textElement_.textContent = headerText;
};

/**
 * @param yOffset {Number}
 * @param width {Number}
 * @param height {Number}
 */
Blockly.SVGHeader.prototype.setPositionSize = function(yOffset, width, height) {
  this.svgGroup_.setAttribute('transform', 'translate(' + 0 + ',' + yOffset + ')');
  this.grayRectangleElement_.setAttribute('width', width);
  this.grayRectangleElement_.setAttribute('height', height);
  this.textElement_.setAttribute('x', this.padding.left);
  var rectangleMiddleY = height / 2;
  // text getBBox() height seems to be off by a bit, 1/3 of getBBox height looks best
  var thirdTextHeight = this.textElement_.getBBox().height / 3;

  this.textElement_.setAttribute('y', rectangleMiddleY + thirdTextHeight);
};

Blockly.SVGHeader.prototype.removeSelf = function () {
  goog.dom.removeNode(this.svgGroup_);
};

/**
 * Class for a functional block-specific contract editor.
 * @constructor
 */
Blockly.ContractEditor = function() {
  Blockly.ContractEditor.superClass_.constructor.call(this);

  /** @type {goog.ui.Select} */
  this.inputTypeSelector = null;
  /** @type {goog.ui.Select} */
  this.outputTypeSelector = null;

  /**
   * Example blocks in this modal dialog
   * @type {!Array.<Blockly.Block>}
   * @private
   */
  this.exampleBlocks_ = [];
  /**
   * Header SVG elements
   * @type {Array.<Blockly.SVGHeader>}
   * @private
   */
  this.exampleBlockHeaders_ = [];
  /**
   * @type {?Blockly.SVGHeader}
   * @private
   */
  this.functionDefinitionHeader_ = null;
};
goog.inherits(Blockly.ContractEditor, Blockly.FunctionEditor);

Blockly.ContractEditor.EXAMPLE_BLOCK_TYPE = 'functional_example';
Blockly.ContractEditor.EXAMPLE_BLOCK_ACTUAL_INPUT_NAME = 'ACTUAL';
Blockly.ContractEditor.MARGIN_BELOW_EXAMPLES = 50; // in px

Blockly.ContractEditor.typesToColors = {
  'none': [0, 0, 0.6],
  'Number': [192, 1.00, 0.99], // 00ccff
  'string': [180, 1.00, 0.60], // 0099999
  'image': [285, 1.00, 0.80], // 9900cc
  'boolean': [90, 1.00, 0.4] // 336600
};

Blockly.ContractEditor.prototype.definitionBlockType = 'functional_definition';
Blockly.ContractEditor.prototype.parameterBlockType = 'functional_parameters_get';

Blockly.ContractEditor.prototype.create_ = function() {
  Blockly.ContractEditor.superClass_.create_.call(this);
};

Blockly.ContractEditor.prototype.hideAndRestoreBlocks_ = function() {
  this.exampleBlocks_.forEach(function(block, index) {
    this.moveToMainBlockSpace_(block);
    this.exampleBlockHeaders_[index].removeSelf();
  }, this);
  this.functionDefinitionHeader_.removeSelf();
  goog.array.clear(this.exampleBlocks_);
  goog.array.clear(this.exampleBlockHeaders_);

  Blockly.ContractEditor.superClass_.hideAndRestoreBlocks_.call(this);
};

Blockly.ContractEditor.prototype.openWithNewFunction = function(opt_blockCreationCallback) {
  Blockly.ContractEditor.superClass_.openWithNewFunction.call(this, opt_blockCreationCallback);

  for (var i = 0; i < Blockly.defaultNumExampleBlocks; i++) {
    this.exampleBlocks_.push(this.createAndAddExampleBlock_());
    var startExampleCountAt = 1;
    var exampleNumber = startExampleCountAt + i;
    this.exampleBlockHeaders_.push(
      new Blockly.SVGHeader(Blockly.modalBlockSpace.svgBlockCanvas_, "Example " + exampleNumber));
  }
  this.functionDefinitionHeader_ =
    new Blockly.SVGHeader(Blockly.modalBlockSpace.svgBlockCanvas_, "Definition");

  this.layOutBlockSpaceItems_();
};

/**
 * @override
 */
Blockly.ContractEditor.prototype.layOutBlockSpaceItems_ = function () {
  var headerHeight = 50;

  var fullWidth = Blockly.modalBlockSpace.getMetrics().viewWidth;
  var currentX = Blockly.RTL ?
    fullWidth - FRAME_MARGIN_SIDE :
    FRAME_MARGIN_SIDE;
  var currentY = 0;

  this.exampleBlocks_.forEach(function(block, index) {
    this.exampleBlockHeaders_[index].setPositionSize(currentY, fullWidth, headerHeight);
    currentY += headerHeight;
    currentY += FRAME_MARGIN_TOP;
    block.moveTo(currentX, currentY);
    currentY += block.getHeightWidth().height;
    currentY += FRAME_MARGIN_TOP;
  }, this);

  this.functionDefinitionHeader_.setPositionSize(currentY, fullWidth, headerHeight);
  currentY += headerHeight;

  currentY += this.flyout_.getHeight();
  this.flyout_.customYOffset = currentY;
  this.flyout_.position_();
  currentY += FRAME_MARGIN_TOP;

  if (this.functionDefinitionBlock) {
    this.functionDefinitionBlock.moveTo(currentX, currentY);
  }
};

/**
 * Creates a new example block in the modal BlockSpace
 * @returns {Blockly.Block} the newly added block
 * @private
 */
Blockly.ContractEditor.prototype.createAndAddExampleBlock_ = function () {
  var temporaryExampleBlock = Blockly.Xml.domToBlock_(Blockly.mainBlockSpace,
    Blockly.createSvgElement('block', {type: Blockly.ContractEditor.EXAMPLE_BLOCK_TYPE}));
  var caller = Blockly.Procedures.createCallerFromDefinition(Blockly.mainBlockSpace,
    this.functionDefinitionBlock);
  temporaryExampleBlock.attachBlockToInputName(
    caller, Blockly.ContractEditor.EXAMPLE_BLOCK_ACTUAL_INPUT_NAME);
  return this.moveToModalBlockSpace_(temporaryExampleBlock);
};

/**
 * @override
 */
Blockly.ContractEditor.prototype.createContractDom_ = function() {
  this.contractDiv_ = goog.dom.createDom('div',
      'blocklyToolboxDiv paramToolbox blocklyText');
  if (Blockly.RTL) {
    this.contractDiv_.setAttribute('dir', 'RTL');
  }
  this.contractDiv_.innerHTML =
      '<div>' + Blockly.Msg.FUNCTIONAL_NAME_LABEL + '</div>'
        + '<div><input id="functionNameText" type="text"></div>'
        + '<div id="description-area" style="margin: 0px;">'
          + '<div>' + Blockly.Msg.FUNCTIONAL_DESCRIPTION_LABEL + '</div>'
          + '<div><textarea id="functionDescriptionText" rows="2"></textarea></div>'
        + '</div>'
        + '<div id="outputTypeTitle">' + Blockly.Msg.FUNCTIONAL_RANGE_LABEL + '</div>'
        + '<span id="outputTypeDropdown"></span>'
        + '<div id="domain-area" style="margin: 0px;">'
          + '<div>' + Blockly.Msg.FUNCTIONAL_DOMAIN_LABEL + '</div>'
          + '<div><input id="paramAddText" type="text" style="width: 200px;" '
          + 'placeholder="' + Blockly.Msg.FUNCTIONAL_NAME_LABEL + '"> '
          + '<span id="paramTypeDropdown"></span>'
          + '<button id="paramAddButton" class="btn">' + Blockly.Msg.ADD
          + '</button>'
        + '</div>'
      + '</div>';
  var metrics = Blockly.modalBlockSpace.getMetrics();
  this.contractDiv_.style.left = metrics.absoluteLeft + 'px';
  this.contractDiv_.style.top = metrics.absoluteTop + 'px';
  this.contractDiv_.style.width = metrics.viewWidth + 'px';
  this.contractDiv_.style.display = 'block';
  this.container_.insertBefore(this.contractDiv_, this.container_.firstChild);

  this.initializeInputTypeDropdown_();
  this.initializeOutputTypeDropdown_();
};

/**
 * @override
 */
Blockly.ContractEditor.prototype.setupUIForBlock_ = function(targetFunctionDefinitionBlock) {
  var isEditingVariable = targetFunctionDefinitionBlock.isVariable();
  this.frameText_.textContent = isEditingVariable ? Blockly.Msg.FUNCTIONAL_VARIABLE_HEADER : Blockly.Msg.FUNCTION_HEADER;
  goog.dom.setTextContent(goog.dom.getElement('outputTypeTitle'),
    isEditingVariable ? Blockly.Msg.FUNCTIONAL_VARIABLE_TYPE : Blockly.Msg.FUNCTIONAL_RANGE_LABEL);
  goog.style.showElement(goog.dom.getElement('domain-area'), !isEditingVariable);
  goog.style.showElement(goog.dom.getElement('description-area'), !isEditingVariable);
  Blockly.ContractEditor.superClass_.show.call(this);
};

/**
 * Add a new parameter block to the toolbox (and set an output type mutation on it)
 * @param {String} newParameterName
 * @param {?String} opt_newParameterType
 * @override
 */
Blockly.ContractEditor.prototype.addParameter = function(newParameterName, opt_newParameterType) {
  this.orderedParamIDsToBlocks_.set(
    goog.events.getUniqueId('parameter'),
    this.newParameterBlock(newParameterName, opt_newParameterType));
};

Blockly.ContractEditor.prototype.newParameterBlock = function(newParameterName, opt_newParameterType) {
  opt_newParameterType = opt_newParameterType || this.inputTypeSelector.getValue();
  var newParamBlockDOM = Blockly.createSvgElement('block', {type: this.parameterBlockType});
  var title = Blockly.createSvgElement('title', {name: 'VAR'}, newParamBlockDOM);
  title.textContent = newParameterName;
  if (opt_newParameterType) {
    var mutation = Blockly.createSvgElement('mutation', {}, newParamBlockDOM);
    var outputType = Blockly.createSvgElement('outputtype', {}, mutation);
    outputType.textContent = opt_newParameterType;
  }
  return newParamBlockDOM;
};

/** @override */
Blockly.ContractEditor.prototype.addParamsFromProcedure_ = function() {
  var procedureInfo = this.functionDefinitionBlock.getProcedureInfo();
  for (var i = 0; i < procedureInfo.parameterNames.length; i++) {
    this.addParameter(procedureInfo.parameterNames[i], procedureInfo.parameterTypes[i]);
  }
};
Blockly.ContractEditor.prototype.initializeOutputTypeDropdown_ = function() {
  this.outputTypeSelector = new goog.ui.Select(null, null,
    goog.ui.FlatMenuButtonRenderer.getInstance());

  goog.object.forEach(Blockly.ContractEditor.typesToColors, function(value, key) {
    this.outputTypeSelector.addItem(new goog.ui.MenuItem(key));
  }, this);
  this.outputTypeSelector.setDefaultCaption(Blockly.Msg.FUNCTIONAL_TYPE_LABEL);

  goog.events.listen(this.outputTypeSelector, goog.ui.Component.EventType.CHANGE,
    goog.bind(this.outputTypeDropdownChange, this));

  this.outputTypeSelector.render(goog.dom.getElement('outputTypeDropdown'));
};

Blockly.ContractEditor.prototype.outputTypeDropdownChange = function(comboBoxEvent) {
  var newType = comboBoxEvent.target.getContent();
  this.functionDefinitionBlock.updateOutputType(newType);
};

Blockly.ContractEditor.prototype.initializeInputTypeDropdown_ = function() {
  this.inputTypeSelector = new goog.ui.Select(null, null,
    goog.ui.FlatMenuButtonRenderer.getInstance());

  goog.object.forEach(Blockly.ContractEditor.typesToColors, function(value, key) {
    this.inputTypeSelector.addItem(new goog.ui.MenuItem(key));
  }, this);
  this.inputTypeSelector.setDefaultCaption(Blockly.Msg.FUNCTIONAL_TYPE_LABEL);

  this.inputTypeSelector.render(goog.dom.getElement('paramTypeDropdown'));
};
