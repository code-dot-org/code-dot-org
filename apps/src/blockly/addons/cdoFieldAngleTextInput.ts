import GoogleBlockly from 'blockly/core';

import CdoAngleHelper from './cdoAngleHelper';
import {ExtendedBlockSvg} from '../types';

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
   * @param {Object} opt_options Legacy options, supported by CDO Blockly
   * @param {string} opt_options.direction a hardcoded direction setting
   * @param {string} opt_options.directionTitle the name of the field from which
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
    if (!direction) {
      direction = 'turnRight';
    }

    super.showEditor_(e);

    const sourceBlock = this.getSourceBlock();
    this.angleHelper = new Blockly.AngleHelper(direction, {
      arcColour: (sourceBlock as ExtendedBlockSvg)?.style.colourPrimary,
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
      enableBackgroundRotation: true,
    });
    Blockly.WidgetDiv.createDom();
    const angleHelperDiv = this.createAngleHelperContainer(
      this.angleHelper.width_
    );
    Blockly.WidgetDiv.getDiv()?.appendChild(angleHelperDiv);
    this.angleHelper.init(angleHelperDiv);
  }

  createAngleHelperContainer(width: number) {
    const div = document.createElement('div');
    div.style.width = width + 'px';
    div.style.backgroundColor = (
      this.getSourceBlock() as ExtendedBlockSvg
    ).style.colourPrimary;
    div.style.padding = '5px';
    div.style.paddingBottom = '0px';
    Blockly.utils.dom.addClass(div, 'blocklyAngleHelperContainer');
    return div;
  }

  doValueUpdate_(newValue: number) {
    super.doValueUpdate_(newValue);
    this.angleHelper?.animateAngleChange(newValue);
  }
}
