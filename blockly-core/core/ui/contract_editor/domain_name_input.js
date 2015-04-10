'use strict';

goog.provide('Blockly.DomainNameInput');

/**
 * A DOM-based input which sends events on changes
 * @param {!Object} options
 * @param {Function} options.onNameChanged with parameter {String} newName
 * @param {Function} options.onEnterPressed
 * @constructor
 */
Blockly.DomainNameInput = function (options) {
  this.onNameChanged = options.onNameChanged;
  this.onEnterPressed = options.onEnterPressed;
  this.name = options.name;

  /**
   * Array of event keys usable by Blockly.unbindEvent_ to remove listeners
   * @type {Array.<Array>}
   * @private
   */
  this.eventsToUnbind_ = [];
  /**
   * Reference to created <input> element for later disposal
   * @type {Element}
   * @private
   */
  this.inputElement_ = null;
};

Blockly.DomainNameInput.prototype.render = function (parent) {
  var inputElement = goog.dom.createDom('input');
  inputElement.type = "text";
  inputElement.style.width = "200px";
  inputElement.style.placeholder = Blockly.Msg.FUNCTIONAL_NAME_LABEL;

  if (this.name) {
    inputElement.value = this.name;
  }

  parent.appendChild(inputElement);


  this.eventsToUnbind_.push(Blockly.bindEvent_(inputElement, 'input', this, this.onInputChange_));
  // IE9 doesn't fire oninput when delete key is pressed, bind keydown also
  this.eventsToUnbind_.push(Blockly.bindEvent_(inputElement, 'keydown', this, this.onInputChange_));

  this.inputElement_ = inputElement;
};

/**
 * @param {Event} DOM event from <input> tag 'input' or 'keydown' changes
 * @private
 */
Blockly.DomainNameInput.prototype.onInputChange_ = function (event) {
  if (this.onNameChanged) {
    this.onNameChanged(event.target.value);
  }
};

Blockly.DomainNameInput.prototype.dispose = function () {
  this.eventsToUnbind_.forEach(function(eventHandle) {
    Blockly.unbindEvent_(eventHandle);
  });
  goog.array.clear(this.eventsToUnbind_);

  goog.dom.removeNode(this.inputElement_);
};
