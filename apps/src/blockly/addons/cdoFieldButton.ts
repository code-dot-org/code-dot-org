import GoogleBlockly, {BlockSvg, FieldValidator} from 'blockly/core';

interface ColorOverrides {
  button?: string;
  icon?: string;
  text?: string;
}

interface CdoFieldButtonOptions {
  value?: string;
  validator?: FieldValidator<string> | null;
  onClick: () => void;
  transformText?: (text: string) => string;
  icon?: SVGElement;
  colorOverrides?: ColorOverrides;
  allowReadOnlyClick?: boolean;
}

export default class CdoFieldButton extends GoogleBlockly.Field {
  private onClick: () => void | undefined;
  private transformText: ((text: string) => string) | undefined;
  private icon: SVGElement | undefined;
  private colorOverrides: ColorOverrides | undefined;
  private allowReadOnlyClick: boolean | undefined;
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
    allowReadOnlyClick = false,
  }: CdoFieldButtonOptions) {
    super(value, validator);
    this.onClick = onClick;
    this.transformText = transformText;
    this.icon = icon;
    this.SERIALIZABLE = true;
    this.colorOverrides = colorOverrides;
    this.allowReadOnlyClick = allowReadOnlyClick;
  }

  static fromJson(options: CdoFieldButtonOptions) {
    return new CdoFieldButton(options);
  }

  /**
   * Create the block UI for this field.
   * @override
   */
  initView() {
    super.initView();
    if (this.icon) {
      const sourceBlock = this.getSourceBlock() as BlockSvg;
      this.icon.style.fill =
        this.colorOverrides?.icon || sourceBlock?.style.colourPrimary;
      // Make the icon centered on Safari.
      this.icon.setAttribute('dominant-baseline', 'central');
      this.textElement_?.appendChild(this.icon);
    }
  }

  /**
   *  Get the text from this field to display on the block. May differ from
   * `getText` with call to `this.transformText` which can change format of text.
   * @override
   */
  getDisplayText_() {
    const text = this.getText();
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
   * If we always want to allow clicking on a read-only field, we
   * call onClick here, otherwise we use the default behavior.
   * @override
   */
  onMouseDown_(e: PointerEvent) {
    if (this.allowReadOnlyClick) {
      this.onClick();
    } else {
      super.onMouseDown_(e);
    }
  }

  /**
   * Contrast background for button with source block
   * @override
   */
  applyColour() {
    const sourceBlock = this.getSourceBlock() as BlockSvg;
    const buttonColor = this.colorOverrides?.button;
    const textColor = this.colorOverrides?.text;
    const iconColor = this.colorOverrides?.icon;

    if (this.icon) {
      this.icon.style.fill = iconColor || sourceBlock?.style.colourPrimary;
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
}
