import GoogleBlockly, {
  FieldNumberConfig,
  FieldNumberValidator,
} from 'blockly/core';

import {EMPTY_OPTION} from '../constants';
import {
  ExtendedBlockSvg,
  ExtendedConnection,
  FieldHelperOptions,
} from '../types';

import CdoAngleHelper from './cdoAngleHelper';

export default class CdoFieldNumber extends GoogleBlockly.FieldNumber {
  private config: string | null | undefined;
  angleHelper: CdoAngleHelper | null;
  direction: string | undefined;
  directionFieldName: string | undefined;

  /**
   * @param value The initial value of the field. Should cast to a number.
   *     Defaults to 0. Also accepts Field.SKIP_SETUP if you wish to skip setup
   *     (only used by subclasses that want to handle configuration and setting
   *     the field value after their own constructors have run).
   * @param min Minimum value. Will only be used if config is not
   *     provided.
   * @param max Maximum value. Will only be used if config is not
   *     provided.
   * @param precision Precision for value. Will only be used if config
   *     is not provided.
   * @param validator A function that is called to validate changes to the
   *     field's value. Takes in a number & returns a validated number, or null
   *     to abort the change.
   * @param config A map of options used to configure the field.
   *     See the [field creation documentation]{@link
   * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/number#creation}
   * for a list of properties this parameter supports.
   */
  constructor(
    value?: string | number,
    min?: string | number | null,
    max?: string | number | null,
    precision?: string | number | null,
    validator?: FieldNumberValidator | null,
    config?: FieldNumberConfig
  ) {
    super(value, min, max, precision, validator, config);
    this.angleHelper = null;
  }

  /**
   * If this field is attached to a block whose output connection is attached to a
   * connection that has the specified field helper, get the options for that
   * field helper.
   * For example, with a math_number block containing this field, we will look at
   * the input connection of parent block. A draw_turn block will have field helper
   * options whereas other blocks, like draw_move, will not. These options are found
   * on the connection of the parent block's input.
   * @param {string} fieldHelper - the field helper to retrieve. One of
   *        Blockly.BlockFieldHelper
   * @return {Object|undefined} the options object if it exists
   */
  getFieldHelperOptions(fieldHelper: string) {
    return (this.sourceBlock_ &&
      this.sourceBlock_.outputConnection &&
      this.sourceBlock_.outputConnection.targetConnection &&
      (
        this.sourceBlock_.outputConnection
          .targetConnection as ExtendedConnection
      ).getFieldHelperOptions(fieldHelper)) as FieldHelperOptions | undefined;
  }

  shouldShowAngleHelper() {
    return this.getFieldHelperOptions(Blockly.BlockFieldHelper.ANGLE_HELPER);
  }

  protected showEditor_(e?: Event, quietInput?: boolean): void {
    super.showEditor_(e, quietInput);
    if (this.shouldShowAngleHelper()) {
      this.initializeAngleHelper();
    }
  }

  /**
   * Initialize the angle helper, which provides an angle-picking UI for Artist
   * turn blocks. Only used when specific field helper options are present.
   * @private
   */
  private initializeAngleHelper() {
    const sourceBlock = this.getSourceBlock();
    this.angleHelper = new Blockly.AngleHelper(this.getAnglePickerDirection(), {
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
   * Get a direction from field helper options - either the hardcoded
   * setting or the direction field. Only used by the angle helper.
   * @returns {string} The direction value.
   */
  getAnglePickerDirection(): string {
    const defaultDirection = 'turnRight';
    const options = this.getFieldHelperOptions(
      Blockly.BlockFieldHelper.ANGLE_HELPER
    );

    if (!options) {
      return defaultDirection;
    }

    if (options.directionTitle) {
      return options.block.getFieldValue(options.directionTitle);
    } else if (options.direction) {
      return options.direction;
    }

    return defaultDirection;
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
   * Override to handle value update and animate the angle helper accordingly,
   * if it exists.
   * @param {number} newValue The new value to update.
   * @private
   */
  doValueUpdate_(newValue: number) {
    super.doValueUpdate_(newValue);
    this.angleHelper?.animateAngleChange(newValue);
  }

  /**
   * Ensure that the input value is a valid number (must fulfill the
   * constraints placed on the field).
   *
   * @param newValue The input value.
   * @returns A valid number, our special case '???' value, or null if invalid
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected override doClassValidation_(newValue: any): number | null {
    if (newValue === EMPTY_OPTION) {
      return newValue; // Return the original value if it's our special case "???"
    }

    return super.doClassValidation_(newValue);
  }
}
