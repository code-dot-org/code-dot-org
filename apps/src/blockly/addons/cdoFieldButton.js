import GoogleBlockly from 'blockly/core';

export default class CdoFieldButton extends GoogleBlockly.Field {
  /**
   * This is a customized field which the user clicks to select an option from a customized picker,
   * for example, the location of a sprite from a grid or a sound file from a customized modal.
   * @param {Object} options - The options for constructing the class.
   * @param {*} options.value Optional. The initial value of the field.
   * @param {Function} [options.validator] Optional. A function that is called to validate changes to the field's value.
   * Takes in a value & returns a validated value, or null to abort a change
   * @param {Function} options.onClick Handles the field's editor.
   * @param {Function} [options.transformText] Handles how the field text is displayed.
   * @param {SVGElement} options.icon SVG <tspan> element - if the field displays a button, this is the icon that is displayed on the button.
   * @param {Object} [options.colorOverrides] - An optional set of colors to use instead of the sourceBlock's styles.
   * @param {string} [options.colorOverrides.button] - An override for the toggle button color.
   * @param {string} [options.colorOverrides.icon] - An override for the color of the icon.
   * @param {string} [options.colorOverrides.text] - An override for the color of the text.
   */
  constructor({
    value,
    validator,
    onClick,
    transformText,
    icon,
    colorOverrides,
  }) {
    super(value, validator);
    this.onClick = onClick;
    this.transformText = transformText;
    this.icon = icon;
    this.SERIALIZABLE = true;
    this.colorOverrides = colorOverrides;
  }

  static fromJson(options) {
    return new CdoFieldButton(options);
  }

  /**
   * Create the block UI for this field.
   * @override
   */
  initView() {
    super.initView();
    if (this.icon) {
      this.icon.style.fill =
        this.colorOverrides?.icon || this.getSourceBlock().style.colourPrimary;
      console.log(this.icon);
      console.log(`width before updateSize_ is ${this.size_.width}`);
      this.textElement_.appendChild(this.icon);
      this.updateSize_();
      console.log(`width after updateSize_ is ${this.size_.width}`);
    }
  }

  /**
   *  Get the text from this field to display on the block. May differ from
   * `getText` with call to `this.transformText` which can change format of text.
   * @override
   */
  getDisplayText_() {
    let text = this.getText();
    if (!text) {
      return GoogleBlockly.Field.NBSP;
    }
    // The transformText function customizes the text for display.
    if (this.transformText) {
      return this.transformText(text);
    }
    return text;
  }

  /**
   * Create an editor for the field.
   * @override
   */
  showEditor_() {
    this.onClick();
  }

  /**
   * Contrast background for button with source block
   * @override
   */
  applyColour() {
    const sourceBlock = this.getSourceBlock();
    const buttonColor = this.colorOverrides?.button;
    const textColor = this.colorOverrides?.text;
    const iconColor = this.colorOverrides?.icon;

    if (this.icon) {
      this.icon.style.fill = iconColor || sourceBlock.style.colourPrimary;
    }

    const borderRect = this.borderRect_;
    if (borderRect && buttonColor) {
      borderRect.setAttribute('style', 'fill: ' + buttonColor);
    }

    const textElement = this.textElement_;
    if (textElement && textColor) {
      textElement.setAttribute('style', 'fill: ' + textColor);
    }
  }

  /**
   * Updates the size of the field based on the text.
   *
   * @param margin margin to use when positioning the text element.
   */
  updateSize_(margin) {
    const constants = this.getConstants();
    const xOffset =
      margin !== undefined
        ? margin
        : this.borderRect_
        ? this.getConstants()?.FIELD_BORDER_RECT_X_PADDING
        : 0;
    let totalWidth = xOffset * 2;
    console.log({totalWidth});
    let totalHeight = constants?.FIELD_TEXT_HEIGHT;

    let contentWidth = 0;
    console.log(
      `font size: ${constants?.FIELD_TEXT_FONTSIZE}, font weight: ${constants?.FIELD_TEXT_FONTWEIGHT}, font family: ${constants?.FIELD_TEXT_FONTFAMILY}`
    );
    if (this.textElement_) {
      contentWidth = Blockly.utils.dom.getFastTextWidth(
        this.textElement_,
        constants?.FIELD_TEXT_FONTSIZE,
        constants?.FIELD_TEXT_FONTWEIGHT,
        constants?.FIELD_TEXT_FONTFAMILY
      );
      console.log({contentWidth});
      totalWidth += contentWidth;
    }
    if (this.borderRect_) {
      totalHeight = Math.max(totalHeight, constants?.FIELD_BORDER_RECT_HEIGHT);
    }

    this.size_.height = totalHeight;
    this.size_.width = totalWidth;

    this.positionTextElement_(xOffset, contentWidth);
    this.positionBorderRect_();
  }
}
