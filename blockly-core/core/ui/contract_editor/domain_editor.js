'use strict';

goog.provide('Blockly.DomainEditor');

goog.require('goog.dom');
goog.require('Blockly.TypeDropdown');
goog.require('Blockly.DomainNameInput');

/**
 * A DOM-based parameter editor
 * @param {!Object} options
 *          name: String
 *          type: Blockly.BlockValueType
 *          onRemovePress
 *          onTypeChanged (newType: String)
 *          onNameChanged (newName: String)
 *          typeChoices {name(String): type(Blockly.BlockValueType)}
 * @constructor
 */
Blockly.DomainEditor = function (options) {
  this.onRemovePress = options.onRemovePress;
  this.onTypeChanged = options.onTypeChanged;
  this.onNameChanged = options.onNameChanged;
  this.typeChoices = options.typeChoices;
  this.type = options.type;
  this.name = options.name;

  // For cleanup
  this.editorDom_ = null;
  this.typeDropdown_ = null;
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

  nameInput.render(editorDOM);
  typeDropdown.render(editorDOM);

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
