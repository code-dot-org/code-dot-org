import GoogleBlockly from 'blockly/core';

/**
 * This is a customized field which the user clicks to toggle between two different states,
 * for example, displaying or hiding the flyout.
 * @param onClick The function that handles the field's editor.
 * @param icon1 SVG <tspan> element - this is the icon that is initially displayed on the button.
 * @param icon2 SVG <tspan> element - this is the icon that is displayed on the button after the first click.
 */
export default class CdoFieldToggle extends GoogleBlockly.Field {
  constructor({onClick, icon1, icon2, useDefaultIcon}) {
    super();
    this.onClick = onClick;
    this.icon1 = icon1;
    this.icon2 = icon2;
    this.useDefaultIcon = useDefaultIcon;
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
    this.icon1.style.fill = this.getSourceBlock().style.colourPrimary;
    this.icon2.style.fill = this.getSourceBlock().style.colourPrimary;
    if (this.useDefaultIcon) {
      this.textElement_.appendChild(this.icon1);
    } else {
      this.textElement_.appendChild(this.icon2);
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
    this.icon1.style.fill = sourceBlock.style.colourPrimary;
    this.icon2.style.fill = sourceBlock.style.colourPrimary;
  }
}
