import GoogleBlockly from 'blockly/core';
import {EMPTY_OPTION} from '../constants';
import {
  printerStyleNumberRangeToList,
  numberListToString,
} from '@cdo/apps/blockly/utils';

export default class CdoFieldDropdown extends GoogleBlockly.FieldDropdown {
  /**
   * Ensure that the input value is a valid language-neutral option.
   * @param newValue The input value.
   * @returns A valid language-neutral option, or null if invalid.
   * @override Add special case for '???' and accommodate valid initial values that are not surrounded
   * by quotes in xml.
   */
  doClassValidation_(newValue) {
    if (newValue === EMPTY_OPTION) {
      return newValue;
    } else {
      for (const option of this.getOptions(true)) {
        if (option[1] === newValue) {
          return newValue;
        } else if (option[1] === `"${newValue}"`) {
          return `"${newValue}"`;
        }
      }

      if (this.sourceBlock_) {
        console.warn(
          "Cannot set the dropdown's value to an unavailable option." +
            ' Block type: ' +
            this.sourceBlock_.type +
            ', Field name: ' +
            this.name +
            ', Value: ' +
            newValue
        );
      }
      return null;
    }
  }

  /**
   * Add special case for '???'.
   * @override
   */
  doValueUpdate_(newValue) {
    if (newValue === EMPTY_OPTION) {
      this.value_ = newValue;
      this.isDirty_ = true;
      this.selectedOption_ = [EMPTY_OPTION, ''];
    } else {
      super.doValueUpdate_(newValue);
    }
  }

  /**
   * Sets the field's state based on the given state value. Should only be
   * called by the serialization system.
   *
   * @param state The state we want to apply to the field.
   * @override because `state` is stored as either json or xml in our code base.
   */
  loadState(state) {
    // Check if state is not stringified xml, i.e., value from json.
    const fieldTagRegEx = /<field/;
    if (!fieldTagRegEx.test(state)) {
      if (this.isOptionListDynamic()) {
        this.getOptions(false);
      }
      this.setValue(state);
      return;
    }
    const field = GoogleBlockly.utils.xml.textToDom(state);
    // Currently, we support the `config` attribute if `config` is stored in xml, but not in json.
    // The config is handled by `fromXml`.
    this.fromXml(field);
  }

  /**
   * Converts xml element into dropdown field
   * @param element xml
   * @override
   */
  fromXml(element) {
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
      const existingOptionsMap = arrayToMap(this.menuGenerator_);
      this.menuGenerator_ = getUpdatedOptionsFromConfig(
        this.config,
        existingOptionsMap
      );
    }
    // Call super so value is set.
    super.fromXml(element);
  }

  /**
   * Converts dropdown field options into xml element
   * @param element xml
   * @return element
   * @override
   */
  toXml(element) {
    if (this.config) {
      element.setAttribute('config', this.config);
    }
    super.toXml(element);
    return element;
  }
}

/**
 * Converts language-neutral string to humnan-readable string.
 */
function toHumanReadableString(text) {
  return text.replace(/['"]+/g, '').toLowerCase();
}

/**
 * Converts an array of option arrays to a map of options
 * For example the array [['first item', 'ITEM1'], ['second item', 'ITEM2']]
 * would be converted to {'first item': 'ITEM1', 'second item': 'ITEM2'}
 * @param optionsArray  field
 * @return map of options
 */
export function arrayToMap(optionsArray) {
  return Array.isArray(optionsArray)
    ? optionsArray.reduce((optionsMap, curr) => {
        optionsMap[curr[1]] = curr[0];
        return optionsMap;
      }, {})
    : {};
}

/**
 * Updates field options based on `config` attribute of field
 * @param config attribute of field
 * @return Array of option arrays
 */
export function getUpdatedOptionsFromConfig(config, existingOptionsMap) {
  const numberList = printerStyleNumberRangeToList(config);
  // If numberList is assigned a non-empty array, it contains a list of numbers.
  // Convert this list to a string of dropdown options separated by commas and assign to options.
  // Otherwise, assign options to config string.
  // Note that `config` is either a printer-style number range or a string of options separated
  // by commas, but not both. For example, a `config` like "1,6-9, &quot;SLOTH&quot;"
  // would NOT be supported.
  let options = numberList.length > 0 ? numberListToString(numberList) : config;
  options = options.split(',').map(val => {
    val = val.trim();
    // If val is one of the options in this.menuGenerator_,
    // human-readable string is displayed.
    if (existingOptionsMap[val]) {
      return [existingOptionsMap[val], val];
    } else {
      // Remove quotes and display option with lowercase characters.
      // For example, "GIRAFFE" would be transformed to giraffe.
      const humanReadableVal = toHumanReadableString(val);
      return [humanReadableVal, val];
    }
  });
  return options;
}
