import {FieldAngle} from '@blockly/field-angle';
import {MenuOption} from 'blockly';
import {CLOCKWISE_TURN_DIRECTION} from '../constants';

interface AngleDropdownOptions {
  direction: string; // Ex. 'turnRight'
  directionTitleName: string; // Ex. 'DIR'
  menuGenerator: MenuOption[];
}

export default class CdoFieldAngleDropdown extends FieldAngle {
  /**
   * Class for an editable field with an angle picker.
   * @param {Object} opt_options Legacy options, supported by CDO Blockly
   * @param {string} opt_options.direction a hardcoded direction setting
   * @param {string} opt_options.directionTitleName the name of the field from which
   *     to obtain direction information
   * @param {Array.<string>} opt_options.menuGenerator An array of valid
   *     value options.
   * @extends {Blockly.FieldAngleDropdown}
   * @constructor
   */
  constructor(opt_options?: AngleDropdownOptions) {
    super();
    this.direction = opt_options?.direction;
    this.directionFieldName = opt_options?.directionTitleName;
    // Hide the degrees symbol, because our blocks have a separate "degrees" label.
    this.symbol = '';
    const menuGenerator = opt_options?.menuGenerator || [];
    if (menuGenerator.length) {
      this.menuGeneratorValues = menuGenerator.map(menuOption =>
        parseInt(menuOption[1])
      );
      this.min_ = Math.min(...this.menuGeneratorValues);
      this.max_ = Math.max(...this.menuGeneratorValues);
    }
  }

  /**
   * Override to allow for clockwise orientation based on a hard-coded direction, or
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

  /**
   * Ensure that the input value is a valid angle.
   *
   * @param newValue The input value.
   * @returns A valid angle, or null if invalid.
   */
  protected doClassValidation_(newValue: number = 0): number | null {
    // The plugin can handle validation automatically, unless our block
    // or XML serialization includes a set of valid options.
    if (!this.configValues && !this.menuGeneratorValues) {
      return super.doClassValidation_(newValue);
    }

    // Get a valid angle value, then find the nearest custom option.
    const validAngleValue = super.doClassValidation_(newValue);

    // A field wouldn't normally have both a menu generator and xml config values.
    // If both are present, we favor the config values as they come directly
    // from the serialization.
    const customValues = this.configValues || this.menuGeneratorValues;
    const closestCustomValue = customValues.reduce(
      (prev: number, curr: number) => {
        return Math.abs(curr - validAngleValue) <
          Math.abs(prev - validAngleValue)
          ? curr
          : prev;
      }
    );
    return closestCustomValue;
  }

  /**
   * Converts xml element into dropdown field
   * @param {Element} element xml field
   * @override
   */
  fromXml(element: Element) {
    // If the field xml contains a `config`, then we can use it to limit the valid selectable options.
    this.config = element.getAttribute('config');
    if (this.config) {
      this.configValues = this.config.split(',').map(Number);
      this.min_ = Math.min(...this.configValues);
      this.max_ = Math.max(...this.configValues);
    }
    super.fromXml(element);
  }

  /**
   * Store config options into xml element
   * @param {Element} element xml field
   * @return element
   * @override
   */
  toXml(element: Element) {
    if (this.config) {
      element.setAttribute('config', this.config);
    }
    super.toXml(element);
    return element;
  }
}
