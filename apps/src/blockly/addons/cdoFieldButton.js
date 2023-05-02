import GoogleBlockly from 'blockly/core';

/**
 * This is a customized field which the user clicks to select an option from a customized picker,
 * for example, the location of a sprite from a grid or a sound file from a customized modal.
 * @param value The initial value of the field.
 * @param validator A function that is called to validate changes to the field's value.
 * Takes in a value & returns a validated value, or null to abort a change
 * @param onChange The function that handles the field's editor.
 * @param onDisplay The function tht handles how the field text is displayed.
 * @param icon SVG <tspan> element - if the field displays a button, this is the icon that is displayed on the button.
 */
export default class CdoFieldButton extends GoogleBlockly.Field {
  constructor(value, validator, onChange, onDisplay, icon) {
    super(value, validator);
    this.onChange = onChange;
    this.onDisplay = onDisplay;
    this.icon = icon;
    this.SERIALIZABLE = true;
  }

  static fromJson(options) {
    return new CdoFieldButton(
      options.value,
      options.validator,
      options.onChange,
      options.onDisplay,
      options.icon
    );
  }

  /**
   * Create the block UI for this field.
   * @override
   */
  initView() {
    super.initView();
    if (this.icon) {
      this.icon.textContent = ' ' + this.icon.textContent;
      this.icon.style.fill = this.getSourceBlock().style.colourPrimary;
      this.textElement_.appendChild(this.icon);
    }
  }

  /**
   *  Get the text from this field to display on the block. May differ from
   * `getText` with call to `this.onDisplay` which can change format of text.
   * @override
   */
  getDisplayText_() {
    let text = this.getText();
    if (!text) {
      return GoogleBlockly.Field.NBSP;
    }
    // The onDisplay function customizes the text for display.
    return this.onDisplay(text);
  }

  /**
   * Create an editor for the field.
   * @override
   */
  showEditor_() {
    this.onChange();
  }

  /**
   * Contrast background for button with source block
   * @override
   */
  applyColour() {
    const sourceBlock = this.getSourceBlock();
    if (this.icon) {
      this.icon.style.fill = sourceBlock.style.colourPrimary;
    }
  }
}
