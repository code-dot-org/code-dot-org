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
   * @param {Object} opt_options Legacy options, supported by CDO Blockly
   * @param {string} opt_options.direction a hardcoded direction setting
   * @param {string} opt_options.directionTitleName the name of the field from which
   *     to obtain direction information
   * @param {CustomMenuGenerator} opt_options.menuGenerator An array of valid
   *     value options.
   * @extends {Blockly.FieldAngleDropdown}
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
   * @param {MouseEvent} e
   * @override
   */
  showEditor_(e?: MouseEvent) {
    let direction = this.direction;
    if (!direction && this.directionFieldName) {
      const sourceBlock = this.getSourceBlock() as ExtendedBlockSvg;
      direction = sourceBlock.getFieldValue(this.directionFieldName);
    }
    if (!direction) {
      direction = 'turnRight';
    }
    super.showEditor_(e);
    Blockly.utils.dom.addClass(
      Blockly.DropDownDiv.getContentDiv(),
      'fieldAngleDropDownContainer'
    );

    const angleHelperContainer = document.createElement('div');
    Blockly.utils.dom.addClass(
      angleHelperContainer,
      'blocklyAngleHelperContainer'
    );
    const sourceBlock = this.getSourceBlock();
    this.angleHelper = new Blockly.AngleHelper(direction, {
      onUpdate: () => {
        const angleValue = this.angleHelper?.getAngle();
        this.setValue(`${angleValue}`);
        // Blockly has no public methods for getting/highlighting/selecting
        // dropdown menu items, so this is a necessary hack.
        const menuItems =
          Blockly.DropDownDiv.getContentDiv().querySelectorAll(
            '.blocklyMenuItem'
          );
        // Mirror the selected angle  value to the dropdown menu options.
        menuItems.forEach((menuItem, index) => {
          // Deselect the current menu item.
          Blockly.utils.dom.removeClass(menuItem, 'blocklyMenuItemHighlight');
          Blockly.utils.dom.removeClass(menuItem, 'blocklyMenuItemSelected');
          // Set any matching option to selected.
          const menuOptionValue = this.getOptions()[index][1];
          if (menuOptionValue === `${angleValue}`) {
            Blockly.utils.dom.addClass(menuItem, 'blocklyMenuItemSelected');
          }
        });
      },
      snapPoints: this.getOptions().map(function (option) {
        return parseInt(option[1]);
      }),
      arcColour: (sourceBlock as ExtendedBlockSvg)?.style.colourPrimary,
      // height: angleHelperHeight,
      // width: angleHelperWidth,
      angle: parseInt(`${this.getValue()}`),
      enableBackgroundRotation: true,
    });
    Blockly.DropDownDiv.getContentDiv().appendChild(angleHelperContainer);
    this.angleHelper.init(angleHelperContainer);

    // In order to preview dropdown menu option, we detect changes to the highlighted
    // menu option and animate the angle helper based on the highlighted option's value.
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
                  const angleValue = (valueNode as Text).nodeValue?.trim();
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
