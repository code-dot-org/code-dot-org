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
};
goog.inherits(Blockly.ContractEditor, Blockly.FunctionEditor);

Blockly.ContractEditor.typesToColors = {
  'Number': [192, 1.00, 0.99], // 00ccff
  'string': [180, 1.00, 0.60], // 0099999
  'image': [285, 1.00, 0.80], // 9900cc
  'boolean': [90, 1.00, 0.4], // 336600
  'none': [0, 0, 0.6]
};

Blockly.ContractEditor.prototype.definitionBlockType = 'functional_definition';
Blockly.ContractEditor.prototype.parameterBlockType = 'functional_parameters_get';

/**
 * @override
 */
Blockly.ContractEditor.prototype.createContractDom_ = function() {
  Blockly.ContractEditor.superClass_.createContractDom_.call(this);
  this.initializeTypeDropdown();
};

Blockly.ContractEditor.prototype.initializeTypeDropdown = function() {
  var flatSelector = new goog.ui.Select(null, null,
    goog.ui.FlatMenuButtonRenderer.getInstance());

  goog.object.forEach(Blockly.ContractEditor.typesToColors, function(value, key) {
    flatSelector.addItem(new goog.ui.MenuItem(key));
  }, this);
  flatSelector.setSelectedIndex(0);

  goog.events.listen(flatSelector, goog.ui.Component.EventType.CHANGE,
    goog.bind(this.typeDropdownChange, this));

  flatSelector.render(goog.dom.getElement('paramTypeDropdown'));
};

Blockly.ContractEditor.prototype.typeDropdownChange = function(comboBoxEvent) {
  var newType = comboBoxEvent.target.getContent();
  console.log('New type is ' + newType);
};

