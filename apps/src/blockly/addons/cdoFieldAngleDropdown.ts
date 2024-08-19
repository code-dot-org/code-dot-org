import {Block} from 'blockly';

import {ExtendedBlockSvg} from '../types';

import CdoAngleHelper from './cdoAngleHelper';
import CdoFieldDropdown, {CustomMenuGenerator} from './cdoFieldDropdown';

interface AngleDropdownOptions {
  direction: string; // Ex. 'turnRight'
  directionTitleName: string; // Ex. 'DIR'
  menuGenerator: CustomMenuGenerator;
}

export default class CdoFieldAngleDropdown extends CdoFieldDropdown {
  angleHelper?: CdoAngleHelper | null;
  direction: string | undefined;
  directionFieldName: string | undefined;

  /**
   * Class for an editable field with an angle picker.
   * @param {AngleDropdownOptions} [opt_options] Legacy options, supported by CDO Blockly
   * @param {string} [opt_options.direction] a hardcoded direction setting
   * @param {string} [opt_options.directionTitleName] the name of the field from which
   *     to obtain direction information
   * @param {CustomMenuGenerator} [opt_options.menuGenerator] An array of valid
   *     value options.
   * @extends {CdoFieldDropdown}
   * @constructor
   */
  constructor(opt_options?: AngleDropdownOptions) {
    super(opt_options?.menuGenerator);
    this.angleHelper = null;
    this.direction = opt_options?.direction;
    this.directionFieldName = opt_options?.directionTitleName;
  }

  /**
   * Override to allow for clockwise orientation based on a hard-coded direction, or
   * a separate direction field on the block.
   * @param {MouseEvent} [e]
   * @override
   */
  showEditor_(e?: MouseEvent) {
    super.showEditor_(e);

    // See cdoCss for custom styling of the dropdown.
    Blockly.utils.dom.addClass(
      Blockly.DropDownDiv.getContentDiv(),
      'fieldAngleDropDownContainer'
    );

    this.initializeAngleHelper();
    this.animateAngleHelperOnMenuOptionHighlight();
  }

  /**
   * Get the direction from either the hardcoded setting or the direction field.
   * @returns {string} The direction value.
   * @private
   */
  private getDirection(): string {
    let direction = this.direction;
    if (!direction && this.directionFieldName) {
      const sourceBlock = this.getSourceBlock() as ExtendedBlockSvg;
      direction = sourceBlock.getFieldValue(this.directionFieldName);
    }
    return direction || 'turnRight';
  }

  /**
   * Create the container element for the angle helper.
   * @returns {HTMLDivElement} The angle helper container element.
   * @private
   */
  private createAngleHelperContainer(): HTMLDivElement {
    const angleHelperContainer = document.createElement('div');
    Blockly.utils.dom.addClass(
      angleHelperContainer,
      'blocklyAngleHelperContainer'
    );
    return angleHelperContainer;
  }

  /**
   * Initialize the angle helper.
   * @private
   */
  private initializeAngleHelper(): void {
    const container = this.createAngleHelperContainer();
    const sourceBlock = this.getSourceBlock() as Block;
    this.angleHelper = new Blockly.AngleHelper(this.getDirection(), {
      onUpdate: this.updateDropdownMenuOptions.bind(this),
      snapPoints: this.getOptions().map(option => parseInt(option[1])),
      arcColour: (sourceBlock as ExtendedBlockSvg)?.style.colourPrimary,
      angle: parseInt(`${this.getValue()}`),
      enableBackgroundRotation: true,
    });
    Blockly.DropDownDiv.getContentDiv().appendChild(container);
    this.angleHelper.init(container);
  }

  /**
   * Update the dropdown menu options to reflect the selected angle value.
   * @private
   */
  private updateDropdownMenuOptions(): void {
    const angleValue = `${this.angleHelper?.getAngle()}`;
    this.setValue(angleValue);
    // Blockly has no public methods for getting dropdown menu items, so this
    // is a necessary hack.
    const menuItems =
      Blockly.DropDownDiv.getContentDiv().querySelectorAll('.blocklyMenuItem');
    // Mirror the selected angle value to the dropdown menu options.
    menuItems.forEach((menuItem, index) => {
      // Block doesn't directly support selecting a new menu option while keeping
      // the dropdown open, so we modify the classes directly.
      Blockly.utils.dom.removeClass(menuItem, 'blocklyMenuItemHighlight');
      Blockly.utils.dom.removeClass(menuItem, 'blocklyMenuItemSelected');
      // Set any matching option(s) to selected.
      const menuOptionValue = this.getOptions()[index][1];
      if (menuOptionValue === angleValue) {
        Blockly.utils.dom.addClass(menuItem, 'blocklyMenuItemSelected');
      }
    });
  }

  /**
   * Observe the menu element for changes and animate the angle helper based on the
   * highlighted option's value.
   * @private
   */
  private animateAngleHelperOnMenuOptionHighlight() {
    // In order to preview dropdown a highlighted menu option, we detect changes to its
    // class and animate the angle helper based on its value. A user might do this by
    // mousing over, pressing up or down, or using keyboard navigation commands.
    // This approach uses the MutationObserver API, which allows us to observe changes
    // to the DOM. We do this because Blockly swallows ArrowUp and ArrowDown key events.
    const menuElement = document.querySelector('.blocklyMenu');
    if (menuElement) {
      const mutationCallback: MutationCallback = mutationsList => {
        mutationsList.forEach(mutation => {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'class'
          ) {
            const target = mutation.target as HTMLElement;
            if (target.classList.contains('blocklyMenuItemHighlight')) {
              const menuItemContent = target.querySelector(
                '.blocklyMenuItemContent'
              );
              if (menuItemContent) {
                const valueNode = menuItemContent.childNodes[1];
                if (valueNode && valueNode.nodeType === Node.TEXT_NODE) {
                  const angleValue =
                    (valueNode as Text).nodeValue?.trim() || '0';
                  this.angleHelper?.animateAngleChange(parseInt(angleValue));
                }
              }
            }
          }
        });
      };

      // Create a MutationObserver instance with the callback
      const observer = new MutationObserver(mutationCallback);

      // Start observing the target element for attribute changes
      const config: MutationObserverInit = {
        attributes: true,
        subtree: true,
        attributeFilter: ['class'],
      };
      observer.observe(menuElement, config);
    }
  }
}
