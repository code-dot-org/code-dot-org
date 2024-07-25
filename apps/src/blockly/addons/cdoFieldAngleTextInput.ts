import {CLOCKWISE_TURN_DIRECTION} from '../constants';
import {FieldHelperOptions} from '../types';

import CdoFieldNumber from './cdoFieldNumber';

interface AngleTextInputOptions {
  directionTitle: string; // Ex. 'DIR'
  direction: 'turnRight' | 'turnLeft';
}

export default class CdoFieldAngleTextInput extends CdoFieldNumber {
  direction: string | undefined;
  directionFieldName: string | undefined;

  /**
   * Class for an editable text field which will shows an angle picker.
   * @param {string} text The initial content of the field.
   * @param {AngleTextInputOptions} [opt_options] Legacy options, supported by CDO Blockly
   * @param {string} [opt_options.direction] a hardcoded direction setting
   * @param {string} [opt_options.directionTitle] the name of the field from which
   * @param {AngleTextInputOptions} [opt_options] Legacy options, supported by CDO Blockly
   * @param {string} [opt_options.direction] a hardcoded direction setting
   * @param {string} [opt_options.directionTitle] the name of the field from which
   *     to obtain direction information
   */
  constructor(text: string, opt_options?: AngleTextInputOptions) {
    super(text);
    this.direction = opt_options?.direction;
    this.directionFieldName = opt_options?.directionTitle;
  }
  /**
   * Get the direction from either the hardcoded setting or the direction field.
   * @returns {string} The direction value.
   * @override
   */
  getAnglePickerDirection(): string {
    let direction = this.direction;
    if (!direction && this.directionFieldName) {
      direction = this.getSourceBlock()?.getFieldValue(this.directionFieldName);
    }
    return direction || CLOCKWISE_TURN_DIRECTION;
  }

  getFieldHelperOptions(field_helper: string) {
    if (field_helper === Blockly.BlockFieldHelper.ANGLE_HELPER) {
      return {
        direction: this.direction,
        directionTitle: this.directionFieldName,
        block: this.getSourceBlock(),
      } as FieldHelperOptions;
    }
  }
}
