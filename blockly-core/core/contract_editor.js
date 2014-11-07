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
 * Class for a functional block-specific contract editor.
 * @constructor
 */
Blockly.ContractEditor = function() {
  Blockly.ContractEditor.superClass_.constructor.call(this);

  /** @type {goog.ui.Select} */
  this.inputTypeSelector = null;
  /** @type {goog.ui.Select} */
  this.outputTypeSelector = null;
};
goog.inherits(Blockly.ContractEditor, Blockly.FunctionEditor);

Blockly.ContractEditor.typesToColors = {
  'none': [0, 0, 0.6],
  'Number': [192, 1.00, 0.99], // 00ccff
  'string': [180, 1.00, 0.60], // 0099999
  'image': [285, 1.00, 0.80], // 9900cc
  'boolean': [90, 1.00, 0.4] // 336600
};

Blockly.ContractEditor.prototype.definitionBlockType = 'functional_definition';
Blockly.ContractEditor.prototype.parameterBlockType = 'functional_parameters_get';

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
      + '<div>' + Blockly.Msg.FUNCTIONAL_DESCRIPTION_LABEL + '</div>'
      + '<div><textarea id="functionDescriptionText" rows="2"></textarea></div>'
      + '<div>' + Blockly.Msg.FUNCTIONAL_RANGE_LABEL + '</div>'
      + '<span id="outputTypeDropdown"></span>'
      + '<div>' + Blockly.Msg.FUNCTIONAL_DOMAIN_LABEL + '</div>'
      + '<div><input id="paramAddText" type="text" style="width: 200px;" '
      + 'placeholder="' + Blockly.Msg.FUNCTIONAL_NAME_LABEL + '"> '
      + '<span id="paramTypeDropdown"></span>'
      + '<button id="paramAddButton" class="btn">' + Blockly.Msg.ADD
      + '</button>'
      + '</div>';
  var metrics = Blockly.modalBlockSpace.getMetrics();
  this.contractDiv_.style.left = metrics.absoluteLeft + 'px';
  this.contractDiv_.style.top = metrics.absoluteTop + 'px';
  this.contractDiv_.style.width = metrics.viewWidth + 'px';
  this.contractDiv_.style.display = 'block';
  this.container_.insertBefore(this.contractDiv_, this.container_.firstChild);

  this.initializeInputTypeDropdown();
  this.initializeOutputTypeDropdown();
};

/**
 * Add a new parameter block to the toolbox (and set an output type mutation on it)
 * @param newParameterName
 * @override
 */
Blockly.ContractEditor.prototype.addParameter = function(newParameterName) {
  var newParameterOutputType = this.inputTypeSelector.getValue();
  // TODO(bjordan): Q: use e.g. document.createElement / .innerHTML / appendChild() instead?
  var param = Blockly.createSvgElement('block', {type: this.parameterBlockType});
  var title = Blockly.createSvgElement('title', {name: 'VAR'}, param);
  title.textContent = newParameterName;
  var mutation = Blockly.createSvgElement('mutation', {}, param);
  var outputType = Blockly.createSvgElement('outputType', {}, mutation);
  outputType.textContent = newParameterOutputType;
  this.paramToolboxBlocks_.push(param);
};

Blockly.ContractEditor.prototype.initializeOutputTypeDropdown = function() {
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

Blockly.ContractEditor.prototype.initializeInputTypeDropdown = function() {
  this.inputTypeSelector = new goog.ui.Select(null, null,
    goog.ui.FlatMenuButtonRenderer.getInstance());

  goog.object.forEach(Blockly.ContractEditor.typesToColors, function(value, key) {
    this.inputTypeSelector.addItem(new goog.ui.MenuItem(key));
  }, this);
  this.inputTypeSelector.setDefaultCaption(Blockly.Msg.FUNCTIONAL_TYPE_LABEL);

  this.inputTypeSelector.render(goog.dom.getElement('paramTypeDropdown'));
};
