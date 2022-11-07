import React from 'react';
import ReactDOM from 'react-dom';
import SoundsPanel from './SoundsPanel';

var CustomFields = CustomFields || {};

/**
 * Class for an editable pitch field.
 * @param {string} text The initial content of the field.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
class FieldSounds extends Blockly.FieldTextInput {
  constructor(options) {
    super(options.currentValue);

    this.options = options;

    // Disable spellcheck.
    this.setSpellcheck(false);

    this.SERIALIZABLE = true;
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

    const div = Blockly.WidgetDiv.getDiv();
    if (!div.firstChild) {
      // Mobile interface uses Blockly.dialog.setPrompt().
      return;
    }
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

    ReactDOM.render(
      <SoundsPanel
        library={this.options.getLibrary()}
        currentValue={this.getValue()}
        onPreview={value => {
          this.options.playPreview(value);
        }}
        onSelect={value => {
          this.setEditorValue_(value);
        }}
      />,
      this.newDiv_
    );

    this.newDiv_.style.color = 'white';
    this.newDiv_.style.width = '300px';
    this.newDiv_.style.backgroundColor = 'black';
    this.newDiv_.style.padding = '5px';
    this.newDiv_.style.cursor = 'pointer';

    return this.newDiv_;
  }

  /**
   * Dispose of events belonging to the pitch picker.
   * @private
   */
  dropdownDispose_() {}

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
