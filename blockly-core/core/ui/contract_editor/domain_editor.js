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
 * @param {Blockly.BlockValueType} options.type
 * @param {Function} options.onRemovePress
 * @param {Function} options.onTypeChanged takes {Blockly.BlockValueType} newType
 * @param {Function} options.onNameChanged takes {string} newName
 * @param {Object.<String, Blockly.BlockValueType>} options.typeChoices
 * @constructor
 */
Blockly.DomainEditor = function (options) {
  this.onRemovePress = options.onRemovePress;
  this.onTypeChanged = options.onTypeChanged;
  this.onNameChanged = options.onNameChanged;
  this.typeChoices = options.typeChoices;
  this.type = options.type;
  this.name = options.name;

  /**
   * @type {Element}
   * @private
   */
  this.editorDom_ = null;
  /**
   * @type {Blockly.TypeDropdown}
   * @private
   */
  this.typeDropdown_ = null;
  /**
   * @type {Blockly.DomainNameInput}
   * @private
   */
  this.nameInput_ = null;
};

/**
 * @param {Element} parent
 */
Blockly.DomainEditor.prototype.render = function (parent) {
  var editorDOM = goog.dom.createDom('div');

  var typeDropdown = new Blockly.TypeDropdown({
    onRemovePress: this.onRemovePress,
    onTypeChanged: this.onTypeChanged,
    typeChoices: this.typeChoices,
    type: this.type
  });

  var nameInput = new Blockly.DomainNameInput({
    onNameChanged: this.onNameChanged,
    name: this.name
  });

  var xButton = new Blockly.XButton({
    onButtonPressed: this.onRemovePress
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
