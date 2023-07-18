import GoogleBlockly from 'blockly/core';

export default class CdoFieldToggle extends GoogleBlockly.Field {
  /**
   * This is a customized field which the user clicks to toggle between two different states,
   * for example, displaying or hiding the the block flyout.
   *
   * @param {Object} options - The options for constructing the class.
   * @param {Function} options.onClick - The function that handles the field's editor.
   * @param {SVGElement} options.defaultIcon - SVG <tspan> element - this is the icon that is initially displayed on the button.
   * @param {SVGElement} options.alternateIcon - SVG <tspan> element - this is the icon that is displayed on the button after the first click.
   * @param {boolean} options.useDefaultIcon - Indicates which icon to use.
   * @param {Function} [options.callback] - A function to call if alternateIcon is used.
   * @param {Object} [options.colorOverrides] - An optional set of colors to use instead of the sourceBlock's styles.
   * @param {string} [options.colorOverrides.icon] - An override for the color of the icons.
   * @param {string} [options.colorOverrides.button] - An override for the toggle button color.
   */
  constructor({
    onClick,
    defaultIcon,
    alternateIcon,
    useDefaultIcon,
    callback,
    colorOverrides,
  }) {
    super();
    this.onClick = onClick;
    this.defaultIcon = defaultIcon;
    this.alternateIcon = alternateIcon;
    this.useDefaultIcon = useDefaultIcon;
    this.callback = callback;
    this.colorOverrides = colorOverrides;
    this.SERIALIZABLE = true;
  }

  /**
   * Construct a CdoFieldToggle from a JSON arg object.
   *
   * @param {Object} options - A JSON object with options.
   * @returns {CdoFieldToggle} The new field instance.
   */
  static fromJson(options) {
    return new CdoFieldToggle(options);
  }

  /**
   * Create the block UI for this field.
   * @override
   */
  initView() {
    super.initView();
    if (this.useDefaultIcon) {
      this.textElement_.appendChild(this.defaultIcon);
    } else {
      this.textElement_.appendChild(this.alternateIcon);
    }
  }

  /**
   * Set the icon to be displayed on the button.
   *
   * @param {boolean} useDefaultIcon - Indicates whether to use the default icon.
   */
  setIcon(useDefaultIcon) {
    this.useDefaultIcon = useDefaultIcon;
    // If the field is not using the default icon, we might want an additional
    // callback, such as opening a block flyout.
    if (!this.useDefaultIcon) {
      typeof this.callback === 'function' &&
        this.callback(this.getSourceBlock());
    }
  }

  /**
   * Get the text from this field to display on the block. May differ from
   * `getText` due to ellipsis, and other formatting.
   *
   * @returns Text to display.
   * @override
   */
  getDisplayText_() {
    return '';
  }

  /**
   * Create an editor for the field.
   * @override
   */
  showEditor_() {
    if (this.useDefaultIcon) {
      this.textElement_.replaceChild(this.alternateIcon, this.defaultIcon);
    } else {
      this.textElement_.replaceChild(this.defaultIcon, this.alternateIcon);
    }
    this.useDefaultIcon = !this.useDefaultIcon;
    this.onClick();
  }

  /**
   * Apply the color settings to the button and icons.
   * Uses colors specified at construction or matches the current
   * style of the block.
   * @override
   */
  applyColour() {
    const sourceBlock = this.getSourceBlock();
    const borderRect = this.borderRect_;
    // If an override is not provided, use the block style to determine colors.
    // Primary and secondary colors are used to provide contrast between
    // the button and the icons.
    this.defaultIcon.style.fill =
      this.colorOverrides?.icon || sourceBlock.style.colourPrimary;
    this.alternateIcon.style.fill =
      this.colorOverrides?.icon || sourceBlock.style.colourPrimary;
    // applyColour is also called when creating insertion markers
    if (borderRect) {
      borderRect.setAttribute(
        'style',
        'fill: ' +
          (this.colorOverrides?.button || sourceBlock.style.colourSecondary)
      );
    }
  }
}
