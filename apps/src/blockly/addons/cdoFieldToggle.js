import GoogleBlockly from 'blockly/core';

export default class CdoFieldToggle extends GoogleBlockly.Field {
  /**
   * This is a customized field which the user clicks to toggle between two different states,
   * for example, displaying or hiding the flyout.
   * @param {Object} options - The options for constructing the class.
   * @param {Function} options.onClick - The function that handles the field's editor.
   * @param {SVGElement} options.icon1 SVG <tspan> element - this is the icon that is initially displayed on the button.
   * @param {SVGElement} options.icon2 SVG <tspan> element - this is the icon that is displayed on the button after the first click.
   * @param {boolean} options.useDefaultIcon - Indicates which icon to use
   * @param {Function} [options.callback] - A function to call if icon2 is used
   * @param {Object} [options.colorOverrides] - An optional set of colors to use instead of the sourceBlock's styles
   * @param {string} [options.colorOverrides.icon] - An override for the color of the icons.
   * @param {string} [options.colorOverrides.button] - An override for the toggle button color.
   */
  constructor({
    onClick,
    icon1,
    icon2,
    useDefaultIcon,
    callback,
    colorOverrides,
  }) {
    super();
    this.onClick = onClick;
    this.icon1 = icon1;
    this.icon2 = icon2;
    this.useDefaultIcon = useDefaultIcon;
    this.callback = callback;
    this.colorOverrides = colorOverrides;
    this.SERIALIZABLE = true;
  }

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
      this.textElement_.appendChild(this.icon1);
    } else {
      this.textElement_.appendChild(this.icon2);
      // If the field is not using the default icon, we might want an additional
      // callback, such as opening a block flyout.
      typeof this.callback === 'function' &&
        this.callback(this.getSourceBlock());
    }
  }

  getDisplayText_() {
    return '';
  }

  /**
   * Create an editor for the field.
   * @override
   */
  showEditor_() {
    if (this.useDefaultIcon) {
      this.textElement_.replaceChild(this.icon2, this.icon1);
    } else {
      this.textElement_.replaceChild(this.icon1, this.icon2);
    }
    this.useDefaultIcon = !this.useDefaultIcon;
    this.onClick();
  }

  /**
   * Contrast background for button with source block
   * @override
   */
  applyColour() {
    const sourceBlock = this.getSourceBlock();
    // If an override is not provided, use the block style to determine colors.
    // Primary and secondary colors are used to provide contrast between
    // the button and the icons.
    this.icon1.style.fill =
      this.colorOverrides?.icon || sourceBlock.style.colourPrimary;
    this.icon2.style.fill =
      this.colorOverrides?.icon || sourceBlock.style.colourPrimary;
    this.getBorderRect().setAttribute(
      'style',
      'fill: ' + this.colorOverrides?.button ||
        sourceBlock.style.colourSecondary
    );
  }
}
