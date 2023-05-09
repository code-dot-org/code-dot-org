import GoogleBlockly from 'blockly/core';
import _ from 'lodash';
import {EMPTY_OPTION} from '../constants';

export default class CdoFieldDropdown extends GoogleBlockly.FieldDropdown {
  /** Add special case for ???
   * @override
   */
  doClassValidation_(newValue) {
    if (newValue === EMPTY_OPTION) {
      return newValue;
    } else {
      return super.doClassValidation_(newValue);
    }
  }

  /** Add special case for ???
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
      let options = this.printerStyleNumberRangeToList(this.config);
      // `options` is not a number range, it is a customized config string.
      if (options.length === 0) {
        options = this.config.split(',').map(val => {
          val = val.trim();
          // If val is a one of the options in this.menuGenerator_,
          // human-readable string is displayed.
          if (originalOptionsMap[val]) {
            return [originalOptionsMap[val], val];
          } else {
            // Remove quotes and display option with lowercase characters.
            // For example, "GIRAFFE" would be transformed to giraffe.
            const humanReadableVal = val.replace(/['"]+/g, '').toLowerCase();
            return [humanReadableVal, val];
          }
        });
      } else {
        // `options` is a list of numbers
        options = options.map(num => {
          const numString = num.toString();
          return [numString, numString];
        });
      }
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

  /**
   * Converts a printer-style string range to an array of numbers
   * e.g., "1,2,4-6" becomes [1,2,4,5,6]
   * @param rangeString {string} printer-style range, e.g., "1,2,4-6"
   * @returns  array of numbers
   */
  printerStyleNumberRangeToList = function (rangeString) {
    const rangeStringNoSpaces = rangeString.replace(/ /g, '');
    const rangeItems = rangeStringNoSpaces.split(',');
    const rangeRegExp = /^(\d+)-(\d+)$/; // e.g., "4-6"
    const numberRegExp = /^(\d+)$/; // e.g., "1", "2"
    const fullNumberList = rangeItems.reduce((numberArray, currExp) => {
      const rangeResult = rangeRegExp.exec(currExp);
      const numberResult = numberRegExp.exec(currExp);
      if (rangeResult) {
        const lowerBound = Number(rangeResult[1]);
        const upperNonInclusiveBound = Number(rangeResult[2]) + 1;
        const rangeArray = _.range(lowerBound, upperNonInclusiveBound);
        numberArray = numberArray.concat(rangeArray);
      } else if (numberResult) {
        numberArray.push(Number(numberResult[1]));
      }
      return numberArray;
    }, []);
    return fullNumberList;
  };
}
