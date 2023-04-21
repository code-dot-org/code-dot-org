import GoogleBlockly from 'blockly/core';

const CORNER_RADIUS = 3;
const INNER_HEIGHT = 16;

export default class CdoFieldButton extends GoogleBlockly.Field {
  // Third argument (color) is used by CDO blockly, so we include it in
  // method signature for compatibility
  constructor(title, opt_buttonHandler, _, opt_changeHandler) {
    super('');

    this.title_ = title;
    this.buttonHandler_ = opt_buttonHandler;
    this.changeHandler_ = opt_changeHandler;
    console.log('changeHandler_', this.changeHandler_);
  }

  /**
   * @override
   */
  init() {
    super.init();

    this.buttonElement_ = Blockly.utils.dom.createSvgElement(
      'rect',
      {
        rx: CORNER_RADIUS,
        ry: CORNER_RADIUS,
        x: 1,
        y: 1,
        height: INNER_HEIGHT,
        width: INNER_HEIGHT
      },
      this.fieldGroup_
    );
    this.buttonElement_.style.fillOpacity = 1;
    this.buttonElement_.style.fill =
      this.getSourceBlock().style.colourSecondary;

    this.textElement_.style.fontSize = '11pt';
    this.textElement_.style.fill = this.getSourceBlock().style.colourPrimary;
    this.textElement_.textContent = '';
    this.textElement_.appendChild(this.title_);

    this.fieldGroup_.insertBefore(this.buttonElement_, this.textElement_);
  }

  /**
   * @override
   */
  getValue() {
    let val = this.value_;
    console.log(typeof val);
    console.log(this.value_);
    return String(this.value_);
  }

  /**
   * @override
   */
  setValue(value) {
    console.log('value in setValue', value);
    if (this.value_ !== value) {
      if (this.changeHandler_) {
        const override = this.changeHandler_(value);
        if (override !== undefined) {
          value = override;
        }
      }
      this.value_ = value;
    }
  }

  /**
   * @override
   */
  showEditor_() {
    if (!this.buttonHandler_) {
      return;
    }
    this.buttonHandler_(this.setValue.bind(this));
  }

  /**
   * Keeps button element size in sync with parent Field
   * @override
   */
  updateSize_() {
    super.updateSize_();

    if (this.buttonElement_) {
      this.buttonElement_.setAttribute('width', this.size_.width - 2);
      this.buttonElement_.setAttribute('height', this.size_.height - 2);
    }
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
    if (this.textElement_) {
      this.textElement_.style.fill = sourceBlock.style.colourPrimary;
    }
  }
}
