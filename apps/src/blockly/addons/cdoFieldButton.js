import GoogleBlockly from 'blockly/core';

const BUTTON_CORNER_RADIUS = 3;
const BUTTON_INNER_HEIGHT = 16;
import {DEFAULT_SOUND} from '@cdo/apps/blockly/constants';

/**
 * This is a customized field which the user clicks to select an option from a customized picker,
 * for example, the location of a sprite from a grid or a sound file from a customized modal.
 * @param value The initial value of the field.
 * @param onChange The function that handles the field's editor.
 * @param onDisplay The function tht handles how the field text is displayed.
 * @param buttonIcon SVG <tspan> element - if the field displays a button, this is the icon that is displayed on the button.
 */
export default class CdoFieldButton extends GoogleBlockly.Field {
  constructor(value, onChange, onDisplay, buttonIcon) {
    super(value);
    this.onChange = onChange;
    this.onDisplay = onDisplay;
    this.buttonIcon = buttonIcon;

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
   * Validate the changes to a field's value before they are set.
   * @override
   */
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

  /**
   * Create the block UI for this field.
   * @override
   */
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
      if (this.buttonIcon) {
        // For location picker, update coordinates of block when dragged out from toolbox.
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
