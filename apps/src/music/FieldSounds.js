import React from 'react';
import ReactDOM from 'react-dom';
import SoundsPanel from './SoundsPanel';
import GoogleBlockly from 'blockly/core';

var CustomFields = CustomFields || {};

/**
 * Class for an editable pitch field.
 * @param {string} text The initial content of the field.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
class FieldSounds extends GoogleBlockly.Field {
  constructor(options) {
    super(options.currentValue);

    this.options = options;
    this.playingPreview = null;
    this.SERIALIZABLE = true;
    this.CURSOR = 'default';
  }

  saveState() {
    return this.getValue();
  }

  loadState(state) {
    this.setValue(state);
  }

  /**
   * Construct a FieldSounds from a JSON arg object.
   * @param {!Object} options A JSON object with options.
   * @returns {!FieldSounds} The new field instance.
   * @package
   * @nocollapse
   */
  static fromJson(options) {
    return new FieldSounds(options);
  }

  /**
   * Show the inline free-text editor on top of the text and the pitch picker.
   * @protected
   */
  showEditor_() {
    super.showEditor_();

    // Build the DOM.
    const editor = this.dropdownCreate_();
    Blockly.DropDownDiv.getContentDiv().appendChild(editor);

    Blockly.DropDownDiv.setColour(
      this.sourceBlock_.style.colourPrimary,
      this.sourceBlock_.style.colourTertiary
    );

    Blockly.DropDownDiv.showPositionedByField(
      this,
      this.dropdownDispose_.bind(this)
    );
  }

  /**
   * Create the pitch picker.
   * @returns {!Element} The newly created pitch picker.
   * @private
   */
  dropdownCreate_() {
    this.newDiv_ = document.createElement('div');

    this.renderContent();

    this.newDiv_.style.color = 'white';
    this.newDiv_.style.width = '300px';
    this.newDiv_.style.backgroundColor = 'black';
    this.newDiv_.style.padding = '5px';
    this.newDiv_.style.cursor = 'pointer';

    return this.newDiv_;
  }

  renderContent() {
    if (!this.newDiv_) {
      return;
    }

    ReactDOM.render(
      <SoundsPanel
        library={this.options.getLibrary()}
        currentValue={this.getValue()}
        playingPreview={this.playingPreview}
        onPreview={(e, value) => {
          this.playingPreview = value;
          this.renderContent();

          e.stopPropagation();

          this.options.playPreview(value, () => {
            // If the user starts another preview while one is
            // already playing, it will have started playing before
            // we get this stop event.  We want to wait until the
            // new preview stops before we reactivate the button, and
            // so we don't clear out this.playingPreview unless the
            // stop event coming in is for the actively playing preview.
            if (this.playingPreview === value) {
              this.playingPreview = null;
            }
            this.renderContent();
          });
        }}
        onSelect={value => {
          this.setValue(value);
          this.hide_();
        }}
      />,
      this.newDiv_
    );
  }

  /**
   * Dispose of events belonging to the pitch picker.
   * @private
   */
  dropdownDispose_() {
    this.newDiv_ = null;
  }

  /**
   * Hide the editor and picker.
   * @private
   */
  hide_() {
    Blockly.WidgetDiv.hide();
    Blockly.DropDownDiv.hideWithoutAnimation();
  }

  /**
   * Get the text to be displayed on the field node.
   * @returns {?string} The HTML value if we're editing, otherwise null.
   * Null means the super class will handle it, likely a string cast of value.
   * @protected
   */
  getText_() {
    if (this.isBeingEdited_) {
      return super.getText_();
    }
    return this.getValue() || null;
  }

  /**
   * Transform the provided value into a text to show in the HTML input.
   * @param {*} value The value stored in this field.
   * @returns {string} The text to show on the HTML input.
   */
  getEditorText_(value) {
    return value;
  }

  /**
   * Transform the text received from the HTML input (note) into a value
   * to store in this field.
   * @param {string} text Text received from the HTML input.
   * @returns {*} The value to store.
   */
  getValueFromEditorText_(text) {
    return text;
  }

  /**
   * Updates the graph when the field rerenders.
   * @private
   * @override
   */
  render_() {
    super.render_();
    this.renderContent();
  }

  /**
   * Ensure that only a valid value may be entered.
   * @param {*} opt_newValue The input value.
   * @returns {*} A valid value, or null if invalid.
   */
  doClassValidation_(opt_newValue) {
    if (opt_newValue === null || opt_newValue === undefined) {
      return null;
    }
    return opt_newValue;
  }
}

CustomFields.FieldSounds = FieldSounds;

export default FieldSounds;
