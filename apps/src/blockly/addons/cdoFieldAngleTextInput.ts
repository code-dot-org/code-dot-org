import GoogleBlockly from 'blockly/core';

import {ExtendedBlockSvg} from '../types';

import CdoAngleHelper from './cdoAngleHelper';

interface AngleTextInputOptions {
  directionTitle: string; // Ex. 'DIR'
  direction: string; // Ex. 'turnRight'
}

export default class CdoFieldAngleTextInput extends GoogleBlockly.FieldNumber {
  angleHelper: CdoAngleHelper | null;
  direction: string | undefined;
  directionFieldName: string | undefined;

  /**
   * Class for an editable text field which will shows an angle picker.
   * @param {string} text The initial content of the field.
   * @param {AngleTextInputOptions} [opt_options] Legacy options, supported by CDO Blockly
   * @param {string} [opt_options.direction] a hardcoded direction setting
   * @param {string} [opt_options.directionTitle] the name of the field from which
   *     to obtain direction information
   */
  constructor(text: string, opt_options?: AngleTextInputOptions) {
    super(text);
    this.angleHelper = null;
    this.direction = opt_options?.direction;
    this.directionFieldName = opt_options?.directionTitle;
  }

  /**
   * Override to allow for clockwise orientation based on a hard-coded direction or
   * a separate direction field on the block.
   * @param {Event} [e]
   * @param {boolean} [quietInput=false] True if editor should be created without focus.
   * @override
   */
  showEditor_(e?: Event, quietInput = false) {
    super.showEditor_(e, quietInput);
    this.initializeAngleHelper();
  }

  /**
   * Get the direction from either the hardcoded setting or the direction field.
   * @returns {string} The direction value.
   * @private
   */
  private getDirection(): string {
    let direction = this.direction;
    if (!direction && this.directionFieldName) {
      direction = this.getSourceBlock()?.getFieldValue(this.directionFieldName);
    }
    return direction || 'turnRight';
  }

  /**
   * Initialize the angle helper.
   * @private
   */
  private initializeAngleHelper() {
    const sourceBlock = this.getSourceBlock();
    this.angleHelper = new Blockly.AngleHelper(this.getDirection(), {
      arcColour: (sourceBlock as ExtendedBlockSvg)?.style.colourPrimary,
      onUpdate: this.updateAngleValue.bind(this),
      angle: parseInt(`${this.getValue()}`),
      enableBackgroundRotation: true,
    });
    Blockly.WidgetDiv.createDom();
    const angleHelperDiv = this.createAngleHelperContainer();
    Blockly.WidgetDiv.getDiv()?.appendChild(angleHelperDiv);
    this.angleHelper.init(angleHelperDiv);
  }

  /**
   * Update the angle value and synchronize it with the input field element.
   * @private
   */
  private updateAngleValue() {
    const angleValue = this.angleHelper?.getAngle();
    this.setValue(angleValue);
    const inputElement =
      document.querySelector<HTMLInputElement>('.blocklyHtmlInput');
    if (inputElement) {
      inputElement.value = `${angleValue}`;
    }
  }

  /**
   * Create the container element for the angle helper.
   * @returns {HTMLDivElement} The angle helper container element.
   * @private
   */
  private createAngleHelperContainer(): HTMLDivElement {
    const div = document.createElement('div');
    if (this.angleHelper?.width_) {
      div.style.width = this.angleHelper.width_ + 'px';
    }
    div.style.backgroundColor = (
      this.getSourceBlock() as ExtendedBlockSvg
    ).style.colourPrimary;
    div.style.padding = '5px';
    div.style.paddingBottom = '0px';
    Blockly.utils.dom.addClass(div, 'blocklyAngleHelperContainer');
    return div;
  }

  /**
   * Override to handle value update and animate the angle helper accordingly.
   * @param {number} newValue The new value to update.
   * @private
   */
  doValueUpdate_(newValue: number) {
    super.doValueUpdate_(newValue);
    this.angleHelper?.animateAngleChange(newValue);
  }
}
