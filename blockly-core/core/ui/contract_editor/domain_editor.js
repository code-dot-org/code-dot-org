'use strict';

goog.provide('Blockly.DomainEditor');

goog.require('goog.dom');
goog.require('Blockly.TypeDropdown');
goog.require('Blockly.DomainNameInput');
goog.require('Blockly.XButton');

/**
 * A DOM-based parameter editor
 * @param {!Object} options
 * @param {string} options.name
 * @param {string} options.paramID unique ID of domain
 * @param {Blockly.BlockValueType} options.type
 * @param {Function} options.onRemovePress
 * @param {Function} options.onTypeChanged takes {Blockly.BlockValueType} newType
 * @param {Function} options.onNameChanged takes {string} uniqueID
 * @param {Object.<String, Blockly.BlockValueType>} options.typeChoices
 * @constructor
 */
Blockly.DomainEditor = function (options) {
  this.options = options;

  /**
   * @private {Element}
   */
  this.editorDom_ = null;
  /**
   * @private {Blockly.TypeDropdown}
   */
  this.typeDropdown_ = null;
  /**
   * @private {Blockly.DomainNameInput}
   */
  this.nameInput_ = null;
};

/**
 * Get unique parameter ID of editor
 * @returns {string}
 */
Blockly.DomainEditor.prototype.getParamID = function () {
  return this.options.paramID;
};

/**
 * @param {Element} parent
 */
Blockly.DomainEditor.prototype.render = function (parent) {
  var editorDOM = goog.dom.createDom('div');

  var typeDropdown = new Blockly.TypeDropdown({
    onTypeChanged: this.options.onTypeChanged,
    typeChoices: this.options.typeChoices,
    type: this.options.type
  });

  var nameInput = new Blockly.DomainNameInput({
    onNameChanged: this.options.onNameChanged,
    name: this.options.name
  });

  var xButton = new Blockly.XButton({
    onButtonPressed: this.options.onRemovePress
  });

  nameInput.render(editorDOM);
  typeDropdown.render(editorDOM);
  xButton.render(editorDOM);

  parent.appendChild(editorDOM);

  // For disposal
  this.editorDom_ = editorDOM;
  this.typeDropdown_ = typeDropdown;
  this.nameInput_ = nameInput;
};

Blockly.DomainEditor.prototype.dispose = function () {
  this.nameInput_.dispose();
  this.typeDropdown_.dispose();
  goog.dom.removeNode(this.editorDom_);
};
