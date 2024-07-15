import {BlockSvg} from 'blockly';

import GoogleBlockly from 'blockly/core';

import CdoAngleHelper from './cdoAngleHelper';

interface AngleTextInputOptions {
  directionTitle: string; // Ex. 'DIR'
  direction: string; // Ex. 'turnRight'
}
export default class CdoFieldAngleTextInput extends GoogleBlockly.FieldNumber {
  newDiv_: HTMLDivElement | null;
  angleHelper: CdoAngleHelper | null;
  direction: string;
  directionFieldName: string;
  /**
   * Class for an editable text field which will shows an angle picker.
   * @param {string} text The initial content of the field.
   * @param {Object} opt_options Legacy options, supported by CDO Blockly
   * @param {string} opt_options.direction a hardcoded direction setting
   * @param {string} opt_options.directionTitle the name of the field from which
   *     to obtain direction information
   */
  constructor(text: string, opt_options: AngleTextInputOptions) {
    super(text);
    this.newDiv_ = null;
    this.angleHelper = null;
    this.direction = opt_options.direction;
    this.directionFieldName = opt_options?.directionTitle;
  }

  /**
   * Override to allow for clockwise orientation based on a hard-coded direction or
   * a separate direction field on the block.
   * @param {Event} e
   * @param quietInput True if editor should be created without focus.
   *     Defaults to false.
   * @override
   */
  showEditor_(e?: Event, quietInput = false) {
    let direction = this.direction;
    if (!direction && this.directionFieldName) {
      direction = this.getSourceBlock()?.getFieldValue(this.directionFieldName);
    }

    super.showEditor_(e);

    const sourceBlock = this.getSourceBlock();
    this.angleHelper = new Blockly.AngleHelper(direction, {
      arcColour: (sourceBlock as BlockSvg)?.style.colourPrimary,
      onUpdate: () => {
        const angleValue = this.angleHelper?.getAngle();
        this.setValue(angleValue);
        const inputElement =
          document.querySelector<HTMLInputElement>('.blocklyHtmlInput');
        if (inputElement) {
          inputElement.value = `${angleValue}`;
        }
      },
      angle: parseInt(`${this.getValue()}`),
    });
    Blockly.WidgetDiv.createDom();
    const angleHelperDiv = this.createDiv(this.angleHelper.width_);
    Blockly.WidgetDiv.getDiv()?.appendChild(angleHelperDiv);
    this.angleHelper.init(angleHelperDiv);
  }

  createDiv(width: number) {
    this.newDiv_ = document.createElement('div');
    this.newDiv_.style.width = width + 'px';
    this.newDiv_.style.backgroundColor = (
      this.getSourceBlock() as BlockSvg
    ).style.colourPrimary;
    this.newDiv_.style.padding = '5px';
    this.newDiv_.style.paddingBottom = '0px';
    return this.newDiv_;
  }

  doValueUpdate_(newValue: number) {
    super.doValueUpdate_(newValue);
    this.angleHelper?.animateAngleChange(newValue);
  }
}
