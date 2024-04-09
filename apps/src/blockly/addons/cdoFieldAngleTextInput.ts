import {FieldAngle} from '@blockly/field-angle';
import {CLOCKWISE_TURN_DIRECTION} from '../constants';

interface AngleTextInputOptions {
  directionTitle: string; // Ex. 'DIR'
  direction: string; // Ex. 'turnRight'
}
export default class CdoFieldAngleTextInput extends FieldAngle {
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
    this.direction = opt_options?.directionTitle;
    this.directionFieldName = opt_options?.direction;
    // Hide the degrees symbol, because our blocks have a separate "degrees" label.
    this.symbol = '';
  }

  /**
   * Override to allow for clockwise orientation based on a hard-coded direction or
   * a separate direction field on the block.
   * @param {Event} e
   * @override
   */
  showEditor_(e?: Event) {
    if (!this.direction && this.directionFieldName) {
      this.direction = this.getSourceBlock().getFieldValue(
        this.directionFieldName
      );
    }

    if (this.direction === CLOCKWISE_TURN_DIRECTION) {
      this.clockwise = true;
    }
    super.showEditor_(e);
  }
}
