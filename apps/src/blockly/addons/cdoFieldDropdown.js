import GoogleBlockly from 'blockly/core';
import {EMPTY_OPTION} from '../constants';
import {
  printerStyleNumberRangeToList,
  numberListToString,
} from '@cdo/apps/p5lab/utils';

export default class CdoFieldDropdown extends GoogleBlockly.FieldDropdown {
  /**
   * Add ability to initialize field value with an option not included
   * in the `menuGenerator`.
   * @override
   */
  doClassValidation_(newValue) {
    return newValue;
  }

  /**
   * Add special case for ??? and options not defined in `menuGenerator`
   * @override
   */
  doValueUpdate_(newValue) {
    this.value_ = newValue;
    this.isDirty_ = true;
    if (newValue === EMPTY_OPTION) {
      this.selectedOption_ = [EMPTY_OPTION, ''];
    } else {
      const options = this.getOptions(true);
      this.selectedOption_ = null;
      for (let i = 0, option; (option = options[i]); i++) {
        if (option[1] === this.value_) {
          this.selectedOption_ = option;
        }
      }
      if (!this.selectedOption_) {
        this.selectedOption_ = [this.toHumanReadableString(newValue), newValue];
      }
    }
  }

  /**
   * Converts xml element into dropdown field
   * @param element xml
   */
  fromXml(element) {
    // Call super so value is set.
    super.fromXml(element);

    // If the field xml contains a `config`, then the dropdown options
    // are determined by `config`.
    // Suppose that `config` is assigned ""ITEM1", "ITEM2", "ITEMX""
    // Then menu dropdown options would be: 'first item', 'second item', 'itemx'.
    // See CDO implementation at https://github.com/code-dot-org/blockly/blob/main/core/ui/fields/field_dropdown.js#L305
    this.config = element.getAttribute('config');
    if (this.config) {
      // If `menuGenerator_` is an array, it is an array of options with
      // each option represented by an array containing 2 elements -
      // a human-readable string and a language-neutral string. For example,
      // [['first item', 'ITEM1'], ['second item', 'ITEM2'], ['third item', 'ITEM3']].
      // Options are included in the block definition.
      const originalOptionsMap = Array.isArray(this.menuGenerator_)
        ? this.menuGenerator_.reduce((optionsMap, curr) => {
            optionsMap[curr[1]] = curr[0];
            return optionsMap;
          }, {})
        : {};

      const numberList = printerStyleNumberRangeToList(this.config);
      // If numberList is assigned a non-empty array, it contains a list of numbers.
      // Convert this list to a string of dropdown options separated by commas and assign to options.
      // otherwise, assign options to config string
      let options =
        numberList.length > 0 ? numberListToString(numberList) : this.config;

      options = options.split(',').map(val => {
        val = val.trim();
        // If val is one of the options in this.menuGenerator_,
        // human-readable string is displayed.
        if (originalOptionsMap[val]) {
          return [originalOptionsMap[val], val];
        } else {
          // Remove quotes and display option with lowercase characters.
          // For example, "GIRAFFE" would be transformed to giraffe.
          const humanReadableVal = this.toHumanReadableString(val);
          return [humanReadableVal, val];
        }
      });

      // set the menuGenerator_ to those config options.
      this.menuGenerator_ = options;
    }
  }

  /**
   * Converts dropdown field options into xml element
   * @param element xml
   * @return element
   */
  toXml(element) {
    super.toXml(element);
    if (this.config) {
      element.setAttribute('config', this.config);
    }
    return element;
  }

  toHumanReadableString(text) {
    return text.replace(/['"]+/g, '').toLowerCase();
  }
}
