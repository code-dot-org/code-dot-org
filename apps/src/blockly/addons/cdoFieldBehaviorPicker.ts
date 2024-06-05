import {
  FieldDropdownConfig,
  FieldDropdownValidator,
  MenuGeneratorFunction,
} from 'blockly/core';

import {EMPTY_OPTION} from '../constants';

import CdoFieldDropdown from './cdoFieldDropdown';

type CustomMenuGenerator = CustomMenuOption[] | MenuGeneratorFunction;
type CustomMenuOption = [string, string];

export default class CdoFieldBehaviorPicker extends CdoFieldDropdown {
  constructor(
    menuGenerator?: CustomMenuGenerator,
    validator?: FieldDropdownValidator,
    config?: FieldDropdownConfig
  ) {
    super(menuGenerator, validator, config);
  }

  /**
   * Ensure that the input value is a valid language-neutral option.
   * @param newValue The input value.
   * @returns A valid language-neutral option, or null if invalid.
   * @override Add special case for '???' and accommodate valid initial values that are not surrounded
   * by quotes in xml.
   */
  doClassValidation_(newValue?: string): string | null {
    const sourceBlock = this.getSourceBlock();
    if (newValue === EMPTY_OPTION) {
      return newValue;
    } else {
      // For behavior picker blocks, we need to regenerate menu options each time,
      // in case a behavior has been renamed.
      const useCache = false;
      for (const option of this.getOptions(useCache, newValue)) {
        if (option[1] === newValue) {
          return newValue;
        } else if (option[1] === `"${newValue}"`) {
          return `"${newValue}"`;
        }
      }

      if (sourceBlock) {
        console.warn(
          "Cannot set the dropdown's value to an unavailable option." +
            ' Block type: ' +
            sourceBlock.type +
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
   * Return a list of the options for this dropdown.
   *
   * @param useCache For dynamic options, whether or not to use the cached
   *     options or to re-generate them.
   * @param {string} newValue The new value to be checked and potentially added
   *     to the options list (behaviorPicker blocks only).
   * @returns A non-empty array of option tuples:
   *     (human-readable text or image, language-neutral name).
   * @throws {TypeError} If generated options are incorrectly structured.
   */
  getOptions(useCache?: boolean, newValue?: string) {
    const options = super.getOptions(useCache);

    // Behavior pickers do not populate correctly until the hidden workspace has been loaded
    // with blocks.
    if (newValue) {
      // Check whether the initial newValue option already exists
      const optionExists = options.some(option => option[0] === newValue);
      const loadingFinished = Blockly.hasLoadedBlocks;
      if (!optionExists && !loadingFinished) {
        // Assume initial value is valid and add it to the menu if not yet present.
        options.push([newValue, newValue]);
      }
    }
    return options;
  }
}
