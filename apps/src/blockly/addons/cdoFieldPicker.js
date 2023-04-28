import GoogleBlockly from 'blockly/core';

const CORNER_RADIUS = 3;
const INNER_HEIGHT = 16;
export default class CdoFieldPicker extends GoogleBlockly.Field {
  constructor(value, onChange, onDisplay, icon) {
    super(value);
    this.onDisplay = onDisplay;
    this.icon = icon;
    this.onChange = onChange;
    this.onDisplay = onDisplay;

    this.SERIALIZABLE = true;
  }

  static fromJson(options) {
    return new CdoFieldPicker(
      options.value,
      options.onChange,
      options.onDisplay
    );
  }

  doClassValidation_(newValue) {
    if (typeof newValue !== 'string') {
      return null;
    }
    return newValue;
  }

  initView() {
    super.initView();
    if (this.icon) {
      this.buttonElement_ = Blockly.utils.dom.createSvgElement(
        'rect',
        {
          rx: CORNER_RADIUS,
          ry: CORNER_RADIUS,
          x: 1,
          y: 1,
          height: INNER_HEIGHT,
          width: INNER_HEIGHT,
        },
        this.fieldGroup_
      );
      this.buttonElement_.style.fillOpacity = 1;
      this.buttonElement_.style.fill =
        this.getSourceBlock().style.colourSecondary;

      this.textElement_.style.fontSize = '11pt';
      this.textElement_.style.fill = this.getSourceBlock().style.colourPrimary;
      this.textElement_.textContent = '';
      this.textElement_.appendChild(this.icon);

      this.fieldGroup_.insertBefore(this.buttonElement_, this.textElement_);
    }
  }

  getDisplayText_() {
    let text = this.getText();
    if (!text) {
      return GoogleBlockly.Field.NBSP;
    }
    return this.onDisplay(text);
  }

  showEditor_() {
    this.onChange();
    super.showEditor_();
  }

  /**
   * Contrast background for button with source block,
   * and match text element to source block each time.
   * Keeps
   * @override
   */
  applyColour() {
    const sourceBlock = this.getSourceBlock();
    if (this.buttonElement_) {
      this.buttonElement_.style.fill = sourceBlock.style.colourSecondary;
    }
  }
}
