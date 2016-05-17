/**
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Input field.  Used for editable titles, variables, etc.
 * This is an abstract class that defines the UI on the block.  Actual
 * instances would be Blockly.FieldTextInput, Blockly.FieldDropdown, etc.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Field');

// TODO(scr): Fix circular dependencies
// goog.require('Blockly.Block');
goog.require('Blockly.BlockSvg');


/**
 * Class for an editable field.
 * @param {string} text The initial content of the field.
 * @constructor
 */
Blockly.Field = function(text) {
  this.sourceBlock_ = null;
  // Build the DOM.
  this.fieldGroup_ = Blockly.createSvgElement('g', {}, null);
  this.borderRect_ = Blockly.createSvgElement('rect',
      {'rx': 4,
       'ry': 4,
       'x': -Blockly.BlockSvg.SEP_SPACE_X / 2,
       'y': -12,
       'height': 16}, this.fieldGroup_);
  this.textElement_ = Blockly.createSvgElement('text',
      {'class': 'blocklyText'}, this.fieldGroup_);
  this.size_ = {height: 25, width: 0};
  this.setText(text);
  this.visible_ = true;
};

/**
 * @returns {Blockly.BlockSpace.blockSpaceEditor}
 * @protected
 */
Blockly.Field.prototype.getParentEditor_ = function() {
  return this.sourceBlock_.blockSpace.blockSpaceEditor;
};

/**
 * The root <svg> element this field is a child of
 * @returns {Blockly.BlockSpaceEditor.svg_}
 * @protected
 */
Blockly.Field.prototype.getRootSVGElement_ = function() {
  return this.getParentEditor_().svg_;
};

/**
 * Non-breaking space.
 */
Blockly.Field.NBSP = '\u00A0';

/**
 * Editable fields are saved by the XML renderer, non-editable fields are not.
 */
Blockly.Field.prototype.EDITABLE = true;

/**
 * Install this field on a block.
 * @param {!Blockly.Block} block The block containing this field.
 */
Blockly.Field.prototype.init = function(block) {
  if (this.sourceBlock_) {
    throw 'Field has already been initialized once.';
  }
  this.sourceBlock_ = block;
  this.updateEditable();
  block.getSvgRoot().appendChild(this.fieldGroup_);
  this.mouseDownWrapper_ = Blockly.bindEvent_(this.fieldGroup_, 'mousedown',
      this, this.onMouseDown_);
  this.mouseUpWrapper_ =
      Blockly.bindEvent_(this.fieldGroup_, 'mouseup', this, this.onMouseUp_);
  this.clickWrapper_ =
      Blockly.bindEvent_(this.fieldGroup_, 'click', this, this.onClick_);
  // Bump to set the colours for dropdown arrows.
  this.setText(null);
};

/**
 * Dispose of all DOM objects belonging to this editable field.
 */
Blockly.Field.prototype.dispose = function() {
  if (this.mouseDownWrapper_) {
    Blockly.unbindEvent_(this.mouseDownWrapper_);
    this.mouseDownWrapper_ = null;
  }
  if (this.mouseUpWrapper_) {
    Blockly.unbindEvent_(this.mouseUpWrapper_);
    this.mouseUpWrapper_ = null;
  }
  if (this.clickWrapper_) {
    Blockly.unbindEvent_(this.clickWrapper_);
    this.clickWrapper_ = null;
  }
  this.sourceBlock_ = null;
  goog.dom.removeNode(this.fieldGroup_);
  this.fieldGroup_ = null;
  this.textElement_ = null;
  this.borderRect_ = null;
};

/**
 * Add or remove the UI indicating if this field is editable or not.
 */
Blockly.Field.prototype.updateEditable = function() {
  if (!this.EDITABLE) {
    return;
  }
  if (this.sourceBlock_.isEditable()) {
    Blockly.addClass_(/** @type {!Element} */ (this.fieldGroup_),
                      'blocklyEditableText');
    Blockly.removeClass_(/** @type {!Element} */ (this.fieldGroup_),
                         'blocklyNoNEditableText');
    this.fieldGroup_.style.cursor = this.CURSOR;
  } else {
    Blockly.addClass_(/** @type {!Element} */ (this.fieldGroup_),
                      'blocklyNonEditableText');
    Blockly.removeClass_(/** @type {!Element} */ (this.fieldGroup_),
                         'blocklyEditableText');
    this.fieldGroup_.style.cursor = '';
  }
};

/**
 * Gets whether this editable field is visible or not.
 * @return {boolean} True if visible.
 */
Blockly.Field.prototype.isVisible = function() {
  return this.visible_;
};

/**
 * Sets whether this editable field is visible or not.
 * @param {boolean} visible True if visible.
 */
Blockly.Field.prototype.setVisible = function(visible) {
  this.visible_ = visible;
  this.getRootElement().style.display = visible ? 'block' : 'none';
};

/**
 * Gets the group element for this editable field.
 * Used for measuring the size and for positioning.
 * @return {!Element} The group element.
 */
Blockly.Field.prototype.getRootElement = function() {
  return /** @type {!Element} */ (this.fieldGroup_);
};

/**
 * Draws the border with the correct width.
 * Saves the computed width in a property.
 * @private
 */
Blockly.Field.prototype.updateWidth_ = function() {
  var width;
  if (this.textElement_.getComputedTextLength &&
      document.body.contains(this.textElement_)) {
    width = this.textElement_.getComputedTextLength();
  } else {
    // Running headless.
    width = 1;
  }
  if (this.borderRect_) {
    this.borderRect_.setAttribute('width',
        width + Blockly.BlockSvg.SEP_SPACE_X);
  }
  this.size_.width = width;
};

/**
 * Returns the height and width of the title.
 * @return {!Object} Height and width.
 */
Blockly.Field.prototype.getSize = function() {
  if (!this.size_.width) {
    this.updateWidth_();
  }
  return this.size_;
};

/**
 * Returns how many pixels of buffer space we want above field. Override by
 * children.
 * @return {Number} Number of pixels
 */
Blockly.Field.prototype.getBufferY = function() {
  return 0;
};

/**
 * Get the text from this field.
 * @return {string} Current text.
 */
Blockly.Field.prototype.getText = function() {
  return this.text_;
};

/**
 * Set the text in this field.  Trigger a rerender of the source block.
 * @param {?string} text New text.
 */
Blockly.Field.prototype.setText = function(text) {
  if (text === null || text === this.text_) {
    // No change if null.
    return;
  }
  this.text_ = text;
  // Empty the text element.
  goog.dom.removeChildren(/** @type {!Element} */ (this.textElement_));
  // Replace whitespace with non-breaking spaces so the text doesn't collapse.
  text = text.replace(/\s/g, Blockly.Field.NBSP);
  if (!text) {
    // Prevent the field from disappearing if empty.
    text = Blockly.Field.NBSP;
  }
  var textNode = document.createTextNode(text);
  this.textElement_.appendChild(textNode);

  // Cached width is obsolete.  Clear it.
  this.size_.width = 0;

  this.refreshRender();
};

/**
 * Trigger a rerender of the source block.
 */
Blockly.Field.prototype.refreshRender = function () {
  if (this.sourceBlock_ && this.sourceBlock_.rendered) {
    this.sourceBlock_.render();
    this.sourceBlock_.bumpNeighbours_();
    this.sourceBlock_.blockSpace.fireChangeEvent();
  }
};

/**
 * By default there is no difference between the human-readable text and
 * the language-neutral values.  Subclasses (such as dropdown) may define this.
 * @return {string} Current text.
 */
Blockly.Field.prototype.getValue = function() {
  return this.getText();
};

/**
 * By default there is no difference between the human-readable text and
 * the language-neutral values.  Subclasses (such as dropdown) may define this.
 * @param {string} text New text.
 */
Blockly.Field.prototype.setValue = function(text) {
  this.setText(text);
};

/**
 * @return {boolean} Whether this field accepts keyboard input.
 * @private
 */
Blockly.Field.prototype.isKeyboardInputField_ = function() {
  // Subclasses which accept keyboard input must override this method.
  return false;
};

/**
 * Returns whether to show the editor on click. Otherwise it will be
 * shown on mousedown.
 * @return {boolean} Whether the editor should be shown on click.
 * @private
 */
Blockly.Field.prototype.showEditorOnClick_ = function() {
  // On Android, we allow inline text editing. The keyboard can only be
  // summoned by a call to el.focus() from within the click handler.

  // On iOS, inline text editing jumps around unpredictably so we use
  // window.prompt instead. Show the prompt on the click event,
  // because if we show it on the mouseup event then other events come
  // in after the prompt closes, causing block deletion or keyboard
  // re-prompting.

  // Limit this behavior to keyboard input fields to avoid the side
  // effects listed below.

  return !!(this.isKeyboardInputField_() &&
      (goog.userAgent.ANDROID || goog.userAgent.MOBILE));
};

/**
 * Handle a mousedown or touchstart event on an editable field.
 * @param {!Event} e Event.
 * @private
 */
Blockly.Field.prototype.onMouseDown_ = function(e) {
  if (this.showEditorOnClick_()) {
    // Preserve the click event by stopping other event handlers from
    // firing. Otherwise, the Block component may call
    // e.preventDefault on the touchstart event which which would
    // suppress the click event.  The side effects of this are that:
    // (1) blocks cannot be dragged by touches to the input field, and
    // (2) in browsers which do not understand CSS touch-action or
    // -ms-touch-action such as Chrome 35 and earlier, the screen can
    // be scrolled by touch events to the input field.

    e.stopPropagation();
  }
};

/**
 * Handle a mouseup or touchend event on an editable field.
 * @param {!Event} e Event.
 * @private
 */
Blockly.Field.prototype.onMouseUp_ = function(e) {
  if (this.showEditorOnClick_()) {
    return;
  } else if (Blockly.isRightButton(e)) {
    // Right-click.
    return;
  } else if (Blockly.Block.isFreelyDragging()) {
    // Drag operation is concluding.  Don't open the editor.
    return;
  } else if (this.sourceBlock_.isEditable()) {
    // Non-abstract sub-classes must define a showEditor_ method.
    this.showEditor_();
  }
};

/**
 * Handle a click event on an editable field.
 * @param {!Event} e Click event.
 * @private
 */
Blockly.Field.prototype.onClick_ = function(e) {
  if (!this.showEditorOnClick_()) {
    return;
  } else if (Blockly.isRightButton(e)) {
    // Right-click.
    return;
  } else if (this.sourceBlock_.isEditable()) {
    this.showEditor_();
  }
};

/**
 * Change the tooltip text for this field.
 * @param {string|!Element} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.
 */
Blockly.Field.prototype.setTooltip = function(newTip) {
  // Non-abstract sub-classes may wish to implement this.  See FieldLabel.
};
