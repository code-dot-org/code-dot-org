/**
 * @fileoverview Non-editable text field, styled like Blockly icons.
 */
'use strict';

goog.provide('Blockly.FieldIcon');

goog.require('Blockly.FieldLabel');

Blockly.FieldIcon = function(text) {
  Blockly.FieldIcon.superClass_.constructor.apply(this, arguments);
  Blockly.addClass_(this.fieldGroup_, 'blocklyIconGroup');
  Blockly.addClass_(this.borderRect_, 'blocklyIconShield');
  this.textElement_.setAttribute('style', 'font-size:9pt; cursor:default;');
};
goog.inherits(Blockly.FieldIcon, Blockly.Field);

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.FieldIcon.prototype.EDITABLE = false;

/**
 * To be overridden by the instance.
 * @private
 */
Blockly.FieldIcon.prototype.showEditor_ = function() {
};
