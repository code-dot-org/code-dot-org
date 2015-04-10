'use strict';

goog.provide('Blockly.XButton');

/**
 * A simple button with an "x" on it which sends an event on press
 *
 * Note: styling depends on bootstrap 'btn' class
 *
 * @param {!Object} options
 * @param options.onNameChanged takes {string} newName
 * @param options.onEnterPressed
 * @constructor
 */
Blockly.XButton = function (options) {
  this.onButtonPressed = options.onButtonPressed;

  // For disposal
  this.eventsToUnbind_ = [];
  this.buttonElement_ = null;
};

Blockly.XButton.prototype.render = function (parent) {
  var buttonElement = goog.dom.createDom('button');
  buttonElement.className = "btn";
  buttonElement.innerHTML = "x";
  buttonElement.style.marginRight = "-10px"; // specific to contract editor

  parent.appendChild(buttonElement);

  this.eventsToUnbind_.push(Blockly.bindEvent_(buttonElement, 'click', this, goog.bind(function () {
    if (this.onButtonPressed) {
      this.onButtonPressed();
    }
  }, this)));

  this.buttonElement_ = buttonElement;
};

Blockly.XButton.prototype.dispose = function () {
  this.eventsToUnbind_.forEach(function(eventHandle) {
    Blockly.unbindEvent_(eventHandle);
  });
  goog.array.clear(this.eventsToUnbind_);

  goog.dom.removeNode(this.buttonElement_);
};
