/**
 * @fileoverview Object representing a separate function editor. This function
 * editor provides a separate modal workspace where a user can modify a given
 * function definition.
 */
'use strict';

goog.provide('Blockly.ContractEditor');

goog.require('Blockly.FunctionEditor');
goog.require('Blockly.ExampleBlockView');
goog.require('Blockly.SvgHeader');
goog.require('Blockly.CustomCssClassMenuRenderer');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.FlatMenuButtonRenderer');
goog.require('goog.ui.Option');
goog.require('goog.ui.Select');
goog.require('goog.ui.Separator');
goog.require('goog.ui.decorate');
goog.require('goog.ui.Component.EventType');
goog.require('goog.events');
goog.require('goog.color');

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
   * @type {!Array.<Blockly.ExampleBlockView>}
   * @private
   */
  this.exampleBlockViews_ = [];
  /**
   * @type {?Blockly.SvgHeader}
   * @private
   */
  this.functionDefinitionHeader_ = null;
};
goog.inherits(Blockly.ContractEditor, Blockly.FunctionEditor);

Blockly.ContractEditor.EXAMPLE_BLOCK_TYPE = 'functional_example';
Blockly.ContractEditor.EXAMPLE_BLOCK_ACTUAL_INPUT_NAME = 'ACTUAL';
Blockly.ContractEditor.MARGIN_BELOW_EXAMPLES = 50; // in px

Blockly.ContractEditor.typesToColorsHSV = {
  'none': [0, 0, 0.6],
  'Number': [192, 1.00, 0.99], // 00ccff
  'string': [180, 1.00, 0.60], // 0099999
  'image': [285, 1.00, 0.80], // 9900cc
  'boolean': [90, 1.00, 0.4] // 336600
};

Blockly.ContractEditor.DEFAULT_OUTPUT_TYPE = 'none';
Blockly.ContractEditor.DEFAULT_PARAMETER_TYPE = 'none';

Blockly.ContractEditor.prototype.definitionBlockType = 'functional_definition';
Blockly.ContractEditor.prototype.parameterBlockType = 'functional_parameters_get';
Blockly.FunctionEditor.prototype.headerString = Blockly.Msg.CONTRACT_EDITOR_HEADER;

Blockly.ContractEditor.prototype.create_ = function() {
  Blockly.ContractEditor.superClass_.create_.call(this);
};

Blockly.ContractEditor.prototype.hideAndRestoreBlocks_ = function() {
  Blockly.ContractEditor.superClass_.hideAndRestoreBlocks_.call(this);
  this.exampleBlockViews_.forEach(function(exampleBlockView) {
    this.moveToMainBlockSpace_(exampleBlockView.block);
    exampleBlockView.header.removeSelf();
  }, this);
  this.functionDefinitionHeader_.removeSelf();
  goog.array.clear(this.exampleBlockViews_);
};

Blockly.ContractEditor.prototype.openAndEditFunction = function(functionName) {
  Blockly.ContractEditor.superClass_.openAndEditFunction.call(this, functionName);

  var exampleBlocks = Blockly.mainBlockSpace.findFunctionExamples(functionName);
  exampleBlocks.forEach(function(exampleBlock, index) {
    var exampleBlockView = new Blockly.ExampleBlockView(
      this.moveToModalBlockSpace_(exampleBlock), index, goog.bind(this.position_, this));
    this.exampleBlockViews_.push(exampleBlockView);
  }, this);

  this.createDefinitionHeader_();
  this.position_();

  this.setTypeDropdownDefaults();
};

Blockly.ContractEditor.prototype.setTypeDropdownDefaults = function() {
  this.inputTypeSelector.setValue(Blockly.ContractEditor.DEFAULT_PARAMETER_TYPE);
  this.outputTypeSelector.setValue(this.functionDefinitionBlock.getOutputType() || 'none');
};

Blockly.ContractEditor.prototype.openWithNewFunction = function(opt_blockCreationCallback) {
  this.ensureCreated_();

  var tempFunctionDefinitionBlock = Blockly.Xml.domToBlock(Blockly.mainBlockSpace,
    Blockly.createSvgElement('block', {type: this.definitionBlockType}));

  if (opt_blockCreationCallback) {
    opt_blockCreationCallback(tempFunctionDefinitionBlock);
  }

  for (var i = 0; i < Blockly.defaultNumExampleBlocks; i++) {
    this.createExampleBlock_(tempFunctionDefinitionBlock);
  }

  this.openAndEditFunction(tempFunctionDefinitionBlock.getTitleValue('NAME'));
};

Blockly.ContractEditor.prototype.createDefinitionHeader_ = function () {
  this.functionDefinitionHeader_ = new Blockly.SvgHeader(Blockly.modalBlockSpace.svgBlockCanvas_,
    { headerText: Blockly.Msg.DEFINE_HEADER_DEFINITION }
  );
};

/**
 * Creates a new example block in the main BlockSpace
 * @returns {Blockly.Block} the newly added block
 * @private
 */
Blockly.ContractEditor.prototype.createExampleBlock_ = function (functionDefinitionBlock) {
  var temporaryExampleBlock = Blockly.Xml.domToBlock(Blockly.mainBlockSpace,
    Blockly.createSvgElement('block', {type: Blockly.ContractEditor.EXAMPLE_BLOCK_TYPE}));
  var caller = Blockly.Procedures.createCallerFromDefinition(Blockly.mainBlockSpace,
    functionDefinitionBlock);
  temporaryExampleBlock.attachBlockToInputName(
    caller, Blockly.ContractEditor.EXAMPLE_BLOCK_ACTUAL_INPUT_NAME);
  return temporaryExampleBlock;
};

/**
 * @override
 */
Blockly.ContractEditor.prototype.layOutBlockSpaceItems_ = function () {
  if (!this.isOpen()) {
    return;
  }

  var headerHeight = 50;

  var fullWidth = Blockly.modalBlockSpace.getMetrics().viewWidth;
  var currentX = Blockly.RTL ?
    fullWidth - FRAME_MARGIN_SIDE :
    FRAME_MARGIN_SIDE;

  var trashcanOffsetBelowBlockSpaceTop =
    (this.modalBlockSpace.trashcan.getHeight() - headerHeight) / 2;
  this.modalBlockSpace.trashcan.repositionBelowBlockSpaceTop(-trashcanOffsetBelowBlockSpaceTop);

  var currentY = 0;

  this.exampleBlockViews_.forEach(function(exampleBlockView) {
    currentY = exampleBlockView.placeStartingAt(currentX, currentY, fullWidth, headerHeight);
  }, this);

  if (this.functionDefinitionHeader_) {
    this.functionDefinitionHeader_.setPositionSize(currentY, fullWidth, headerHeight);
    currentY += headerHeight;
  }

  if (this.flyout_) {
    currentY += this.flyout_.getHeight();
    this.flyout_.customYOffset = currentY;
    this.flyout_.position_();
  }
  currentY += FRAME_MARGIN_TOP;

  if (this.functionDefinitionBlock) {
    this.functionDefinitionBlock.moveTo(currentX, currentY);
  }
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
  var metrics = this.modalBlockSpace.getMetrics();
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
  this.outputTypeSelector = this.createTypeDropdown_();
  this.outputTypeSelector.render(this.getOutputTypeDropdownElement_());

  goog.events.listen(this.outputTypeSelector, goog.ui.Component.EventType.CHANGE,
    goog.bind(this.outputTypeDropdownChange_, this));
};

Blockly.ContractEditor.prototype.outputTypeDropdownChange_ = function(comboBoxEvent) {
  var newType = comboBoxEvent.target.getContent();
  var menuButtonRenderer = goog.ui.FlatMenuButtonRenderer.getInstance();
  var menuButtonElement = menuButtonRenderer.getContentElement(this.getOutputTypeDropdownElement_());
  this.setBackgroundFromHSV(menuButtonElement, Blockly.ContractEditor.typesToColorsHSV[newType]);

  if (this.functionDefinitionBlock) {
    this.functionDefinitionBlock.updateOutputType(newType);
  }
};

Blockly.ContractEditor.prototype.getOutputTypeDropdownElement_ = function () {
  return goog.dom.getElement('outputTypeDropdown');
};

Blockly.ContractEditor.prototype.getInputTypeDropdownElement_ = function () {
  return goog.dom.getElement('paramTypeDropdown');
};

Blockly.ContractEditor.prototype.initializeInputTypeDropdown_ = function() {
  this.inputTypeSelector = this.createTypeDropdown_();
  this.inputTypeSelector.render(goog.dom.getElement('paramTypeDropdown'));

  goog.events.listen(this.inputTypeSelector, goog.ui.Component.EventType.CHANGE,
    goog.bind(this.inputTypeDropdownChange_, this));
};

Blockly.ContractEditor.prototype.inputTypeDropdownChange_ = function(comboBoxEvent) {
  var newType = comboBoxEvent.target.getContent();
  this.colorInputButtonForType_(newType);
};

Blockly.ContractEditor.prototype.colorInputButtonForType_ = function(newType) {
  var menuButtonRenderer = goog.ui.FlatMenuButtonRenderer.getInstance();
  var menuButtonElement = menuButtonRenderer.getContentElement(this.getInputTypeDropdownElement_());
  this.setBackgroundFromHSV(menuButtonElement, Blockly.ContractEditor.typesToColorsHSV[newType]);
};

/**
 * @returns {goog.ui.Select} new dropdown
 * @private
 */
Blockly.ContractEditor.prototype.createTypeDropdown_ = function() {
  var newTypeDropdown = new goog.ui.Select(null, null,
    goog.ui.FlatMenuButtonRenderer.getInstance(),
    null,
    new Blockly.CustomCssClassMenuRenderer('colored-type-dropdown'));
  goog.object.forEach(Blockly.ContractEditor.typesToColorsHSV, function(color, key) {
    var menuItem = new goog.ui.MenuItem(key);
    newTypeDropdown.addItem(menuItem);
    this.setMenuItemColor_(menuItem, color);
  }, this);
  return newTypeDropdown;
};

/**
 * @param {!goog.ui.MenuItem} menuItem
 * @param {!Array.<Number>} hsvColor
 * @private
 */
Blockly.ContractEditor.prototype.setMenuItemColor_ = function(menuItem, hsvColor) {
  var menuItemElement = menuItem.getElement();
  this.setBackgroundFromHSV(menuItemElement, hsvColor);
};

Blockly.ContractEditor.prototype.setBackgroundFromHSV = function (menuItemElement, hsvColor) {
  menuItemElement.style.background =
    goog.color.hsvToHex(hsvColor[0], hsvColor[1], hsvColor[2] * 255);
};
