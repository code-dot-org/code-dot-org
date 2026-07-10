import * as BlocklyCore from 'blockly/core';

import {CdoFieldImageDropdown} from './cdoFieldImageDropdown';

interface ButtonConfig {
  text: string;
  action: () => void;
}

export default class CdoFieldAnimationDropdown extends CdoFieldImageDropdown {
  constructor(
    menuGenerator: BlocklyCore.MenuOption[] | (() => BlocklyCore.MenuOption[]),
    width: number,
    height: number,
    buttons: ButtonConfig[] | undefined
  ) {
    super(menuGenerator, width, height, buttons);
  }

  /**
   * @override
   * Ensure that the input value is a valid language-neutral option.
   * The first change we made from the parent method is to not use the cache,
   * as the list of options can change. The second is to remove a warning if the
   * value is invalid. We do this because levelbuilders frequently edit level
   * animations after setting the block XML and we want to avoid a flood
   * of console warnings.
   *
   * @param newValue The input value.
   * @returns A valid language-neutral option, or null if invalid.
   */
  doClassValidation_(newValue: string) {
    const options = this.getOptions(false); // false = do not use cache

    const isValueValid = options.some(option => option[1] === newValue);

    return isValueValid ? newValue : null;
  }

  /**
   * Re-resolve the rendered thumbnail from freshly generated options, for
   * menus whose option images can change after the field first renders.
   */
  refreshSelectedOption() {
    // Regenerate the options cache, then re-set the current value:
    // FieldDropdown.doValueUpdate_ re-resolves the private selectedOption
    // (which drives the rendered image) from the cached options.
    this.getOptions(false);
    this.setValue(this.getValue());
    this.forceRerender();
  }
}
