import GoogleBlockly from 'blockly/core';

/**
 * This is a customized field which the user clicks to select an option from a customized picker,
 * for example, the location of a sprite from a grid or a sound file from a customized modal.
 * @param value The initial value of the field.
 * @param validator A function that is called to validate changes to the field's value.
 * Takes in a value & returns a validated value, or null to abort a change
 * @param onChange The function that handles the field's editor.
 * @param onDisplay The function tht handles how the field text is displayed.
 * @param buttonIcon SVG <tspan> element - if the field displays a button, this is the icon that is displayed on the button.
 * @param editFieldLabel boolean - true if the label adjacent to this field is updated with change in field value
 */
export default class CdoFieldButton extends GoogleBlockly.Field {
  constructor(value, validator, onChange, onDisplay, button, editFieldLabel) {
    super(value, validator);
    this.onChange = onChange;
    this.onDisplay = onDisplay;
    if (button) {
      this.button = button;
    }
    this.editFieldLabel = editFieldLabel;
    this.SERIALIZABLE = true;
  }

  static fromJson(options) {
    return new CdoFieldButton(
      options.value,
      options.onChange,
      options.onDisplay,
      options.buttonIcon
    );
  }

  /**
   * Create the block UI for this field.
   * @override
   */
  initView() {
    super.initView();
    if (this.button) {
      this.buttonElement_ = Blockly.utils.dom.createSvgElement(
        'rect',
        {
          rx: this.button.cornerRadius,
          ry: this.button.cornerRadius,
          x: 1,
          y: 1,
          height: this.button.innerHeight,
          width: this.button.innerHeight,
        },
        this.fieldGroup_
      );
      this.buttonElement_.style.fillOpacity = 1;
      this.buttonElement_.style.fill =
        this.getSourceBlock().style.colourSecondary;

      this.textElement_.style.fontSize = '11pt';
      this.textElement_.style.fill = this.getSourceBlock().style.colourPrimary;
      this.textElement_.textContent = '';
      this.textElement_.appendChild(this.button.icon);

      this.fieldGroup_.insertBefore(this.buttonElement_, this.textElement_);
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
   * Used to update the value of a field.
   * @override
   */
  doValueUpdate_(newValue) {
    if (this.value_ !== newValue) {
      this.value_ = newValue;
      if (this.editFieldLabel) {
        // Update display on block label when block is dragged out from toolbox.
        this.onDisplay(newValue);
      }
      this.isDirty_ = true; // Block needs to be re-rendered.
    }
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
    if (this.buttonElement_) {
      this.buttonElement_.style.fill = sourceBlock.style.colourSecondary;
    }
  }
}
