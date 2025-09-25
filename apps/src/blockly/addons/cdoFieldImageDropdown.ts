import {FieldGridDropdown} from '@blockly/field-grid-dropdown';
import * as GoogleBlockly from 'blockly/core';

import color from '@cdo/apps/util/color';

interface ButtonConfig {
  text: string;
  action: () => void;
}

// Note that this class *does not* inherit from CdoFieldDropdown
export class CdoFieldImageDropdown extends FieldGridDropdown {
  private buttons_: ButtonConfig[] | undefined;
  private imageWidth_: number;
  private imageHeight_: number;
  private whiteBackground: boolean;
  private primaryColour_?: string;
  private borderColour_?: string;
  private focusColour_?: string;

  constructor(
    menuGenerator:
      | GoogleBlockly.MenuOption[]
      | (() => GoogleBlockly.MenuOption[]),
    width: number,
    height: number,
    buttons: ButtonConfig[] | undefined,
    whiteBackground: boolean = true
  ) {
    // We have to decide how many columns to have when we create the block. The
    // number of options in the block can change over time, but we can just use
    // the initial number of options to determine how many columns to show- we're
    // assuming that the number of options usually won't change that drastically,
    // so the number of columns can probably stay the same.
    const initialOptions = fixMenuGenerator(menuGenerator, width, height);
    const numColumns = Math.max(
      4,
      Math.floor(Math.sqrt(initialOptions.length))
    );

    super(
      () => fixMenuGenerator(menuGenerator, width, height),
      undefined /* validator */,
      {
        columns: numColumns,
        primaryColour: color.white,
        borderColour: color.white,
      }
    );

    this.buttons_ = buttons;
    this.imageWidth_ = width;
    this.imageHeight_ = height;
    this.whiteBackground = whiteBackground;
    this.focusColour_ = 'rgba(0,0,0,.3)';
  }

  /**
   * @override
   * Customized version of `Blockly.FieldDropdown.showEditor_` and
   * `FieldGridDropdown.showEditor_` with the following functionality changes:
   *
   * 1. Overrides grid colours based on the source block.
   * 2. Dynamically styles grid items and their embedded images.
   * 3. Adds custom buttons below the grid.
   *
   * @param e Optional mouse event that triggered the field to open, or
   *  undefined if triggered programmatically.
   */
  protected showEditor_(e?: MouseEvent) {
    super.showEditor_(e);

    const block = this.getSourceBlock() as GoogleBlockly.BlockSvg | null;
    if (block) {
      const parent = block.getParent();
      const isShadow = block.isShadow();

      const colorSourceBlock = isShadow ? parent! : block;
      if (this.whiteBackground) {
        this.primaryColour_ = color.white;
        this.focusColour_ = colorSourceBlock.style.colourTertiary;
      } else {
        this.primaryColour_ = colorSourceBlock.style.colourTertiary;
        // Use the default focusColour_, a semi-transparent black.
      }
      this.borderColour_ = colorSourceBlock.style.colourPrimary;
      Blockly.DropDownDiv.setColour(this.primaryColour_, this.borderColour_);
    }

    const gridItems: HTMLElement[] = Array.from(
      document.querySelectorAll('.blocklyFieldGrid .blocklyFieldGridItem')
    );
    gridItems.forEach(element => {
      // Dynamic styling for .blocklyFieldGrid .blocklyFieldGridItem
      element.style.height = this.imageHeight_ + 'px';
      element.style.width = this.imageWidth_ + 'px';
      element.addEventListener('focus', () => {
        element.style.boxShadow = `0 0 0 4px ${this.focusColour_}`;
      });
      element.addEventListener('blur', () => {
        element.style.boxShadow = '';
      });

      // Dynamic styling for .blocklyFieldGrid .blocklyFieldGridItem img
      const imgElement = element.querySelector(
        'img'
      ) as HTMLImageElement | null;
      if (imgElement) {
        imgElement.style.maxWidth = this.imageWidth_ + 'px';
        imgElement.style.maxHeight = this.imageHeight_ + 'px';
      }
    });

    if (this.buttons_) {
      const gridContainer = document.querySelector(
        '.blocklyFieldGridContainer'
      ) as HTMLElement;
      // Add buttons below the grid.
      this.buttons_.forEach(button => {
        const buttonElement = document.createElement('BUTTON');
        buttonElement.innerHTML = button.text;
        buttonElement.addEventListener('click', button.action);
        buttonElement.addEventListener('click', () =>
          Blockly.DropDownDiv.hideIfOwner(this, true)
        );
        gridContainer.appendChild(buttonElement);
      });
    }
  }
}

export function fixMenuGenerator(
  menuGenerator:
    | GoogleBlockly.MenuOption[]
    | (() => GoogleBlockly.MenuOption[]),
  width: number,
  height: number
): GoogleBlockly.MenuOption[] {
  // Google Blockly supports images in dropdowns but has a different format,
  // so we just need to restructure our menu items before passing through to
  // the FieldDropdown constructor.
  // CDO Blockly format: Each menu item is a two element array: the first is
  // the image url; the second is the generated code.
  // Google Blockly format: Each menu item is a two element array: the first is
  // an object containing the image url, width, height, and alt text; the second
  // is the generated code.
  const options =
    typeof menuGenerator === 'function' ? menuGenerator() : menuGenerator;
  return options.map(menuItem => {
    const url = menuItem[0];
    const code_id = menuItem[1];
    // TODO: add better alt text. For now, it's just using the code name for the
    // image, but that's not necessarily a student-friendly string. (for example,
    // in Basketball, the hand dropdown has hand_1, hand_2, and hand_3, which might
    // benefit from more descriptive alt text.)
    return [
      {src: url, width: width, height: height, alt: code_id},
      code_id,
    ] as [GoogleBlockly.ImageProperties, string];
  });
}
