import GoogleBlockly from 'blockly/core';

const BUTTON_CORNER_RADIUS = 3;
const BUTTON_INNER_HEIGHT = 16;
import {DEFAULT_SOUND} from '@cdo/apps/blockly/constants';

export default class CdoFieldPicker extends GoogleBlockly.Field {
  constructor(value, onChange, onDisplay, buttonIcon) {
    super(value);
    this.onChange = onChange;
    this.onDisplay = onDisplay;
    this.buttonIcon = buttonIcon;

    this.SERIALIZABLE = true;
  }

  static fromJson(options) {
    return new CdoFieldPicker(
      options.value,
      options.onChange,
      options.onDisplay,
      options.buttonIcon
    );
  }

  doClassValidation_(newValue) {
    if (typeof newValue !== 'string') {
      return null;
    }
    // Handle 'play sound' block with default param from CDO blockly.
    // TODO: Remove when sprite lab is migrated to Google blockly.
    if (newValue === 'Choose') {
      return DEFAULT_SOUND;
    }
    return newValue;
  }

  initView() {
    super.initView();
    if (this.buttonIcon) {
      this.buttonElement_ = Blockly.utils.dom.createSvgElement(
        'rect',
        {
          rx: BUTTON_CORNER_RADIUS,
          ry: BUTTON_CORNER_RADIUS,
          x: 1,
          y: 1,
          height: BUTTON_INNER_HEIGHT,
          width: BUTTON_INNER_HEIGHT,
        },
        this.fieldGroup_
      );
      this.buttonElement_.style.fillOpacity = 1;
      this.buttonElement_.style.fill =
        this.getSourceBlock().style.colourSecondary;

      this.textElement_.style.fontSize = '11pt';
      this.textElement_.style.fill = this.getSourceBlock().style.colourPrimary;
      this.textElement_.textContent = '';
      this.textElement_.appendChild(this.buttonIcon);

      this.fieldGroup_.insertBefore(this.buttonElement_, this.textElement_);
    }
  }

  getDisplayText_() {
    let text = this.getText();
    if (!text) {
      return GoogleBlockly.Field.NBSP;
    }
    // The onDisplay function customizes the text for display.
    return this.onDisplay(text);
  }

  doValueUpdate_(newValue) {
    if (this.value_ !== newValue) {
      this.value_ = newValue;
      if (this.buttonIcon) {
        // For location picker, update coordinates of block when dragged out from toolbox.
        this.onDisplay(newValue);
      }
      this.isDirty_ = true; // Block needs to be re-rendered.
    }
  }

  showEditor_() {
    this.onChange();
    super.showEditor_();
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
