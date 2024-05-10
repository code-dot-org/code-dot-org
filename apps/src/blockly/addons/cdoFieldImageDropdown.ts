import {FieldGridDropdown} from '@blockly/field-grid-dropdown';
import {BlockSvg, MenuItem, MenuOption} from 'blockly';
import {ImageProperties} from 'blockly/core/field_dropdown';

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

  constructor(
    menuGenerator: MenuOption[] | (() => MenuOption[]),
    width: number,
    height: number,
    buttons: ButtonConfig[] | undefined
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
      {columns: numColumns}
    );

    this.buttons_ = buttons;
    this.imageWidth_ = width;
    this.imageHeight_ = height;
  }

  /**
   * @override
   * Duplicated from Blockly.FieldDropdown.showEditor_ and FieldGridDropdown.showEditor_
   * There are two functionality changes:
   * 1. Override primaryColour to always be white. FieldGridGropdown allows overriding the primary
   *  color via config, but it happens in showEditor_, which we need to override because of 2.
   * 2. Create MenuItems for the buttons and add them before we render the menu.
   * We are accessing private fields here, so if we upgrade Blockly we should verify no names changed.
   */
  showEditor_(opt_e?: MouseEvent) {
    // dropdownCreate is private in the parent.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).dropdownCreate();
    // dropdownCreate creates a menu, this is just to make TypeScript happy.
    if (!this.menu_) {
      return;
    }
    if (opt_e && typeof opt_e.clientX === 'number') {
      this.menu_.openingCoords = new Blockly.utils.Coordinate(
        opt_e.clientX,
        opt_e.clientY
      );
    } else {
      this.menu_.openingCoords = null;
    }

    if (this.buttons_) {
      // Force buttons to a new row by adding blank elements if needed.
      // menuItems is private in the parent.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const numItems = ((this.menu_ as any).menuItems as MenuItem[]).length;
      // columns is private in the parent.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const columns = (this as any).columns as number;
      const numInLastRow = numItems % columns;
      const numBlankToAdd = numInLastRow > 0 ? columns - numInLastRow : 0;
      for (let i = 0; i < numBlankToAdd; i++) {
        const item = document.createElement('div');
        item.style.width = this.imageWidth_ + 'px';
        item.style.height = this.imageHeight_ + 'px';
        const menuItem = new Blockly.MenuItem(item, '');
        menuItem.setEnabled(false);
        this.menu_.addChild(menuItem);
      }

      // Add buttons to menu
      this.buttons_.forEach(button => {
        const buttonElement = document.createElement('BUTTON');
        buttonElement.innerHTML = button.text;
        buttonElement.addEventListener('click', button.action);
        buttonElement.addEventListener('click', () =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Blockly.DropDownDiv.hideIfOwner(this as any, true)
        );
        const menuItem = new Blockly.MenuItem(buttonElement, '');
        menuItem.setRole(Blockly.utils.aria.Role.OPTION);
        menuItem.setRightToLeft(this.sourceBlock_?.RTL || false);
        menuItem.setEnabled(false);
        this.menu_?.addChild(menuItem);
      });
    }

    // Element gets created in render.
    this.menu_.render(Blockly.DropDownDiv.getContentDiv());
    const menuElement = this.menu_.getElement();
    if (menuElement) {
      Blockly.utils.dom.addClass(menuElement, 'blocklyDropdownMenu');
      Blockly.utils.dom.addClass(menuElement, 'fieldGridDropDownContainer');
    }

    if (this.sourceBlock_) {
      const primaryColour = color.white;
      const sourceBlockSvg = this.sourceBlock_ as BlockSvg;
      const parent = sourceBlockSvg.getParent();
      const borderColour =
        sourceBlockSvg.isShadow() && parent
          ? parent.style.colourTertiary
          : sourceBlockSvg.style.colourTertiary;
      Blockly.DropDownDiv.setColour(primaryColour, borderColour);
    }

    // Focusing needs to be handled after the menu is rendered and positioned.
    // Otherwise it will cause a page scroll to get the misplaced menu in
    // view. See issue #1329.
    this.menu_.focus();

    // selectedMenuItem is private in the parent.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedMenuItem = (this as any).selectedMenuItem as MenuItem | null;
    if (selectedMenuItem) {
      this.menu_.setHighlighted(selectedMenuItem);
    }

    this.applyColour();

    // updateColumnsStyling_ is private in the parent.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).updateColumnsStyling_();

    Blockly.DropDownDiv.showPositionedByField(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this as any,
      this.dropdownDispose_.bind(this)
    );
  }
}

export function fixMenuGenerator(
  menuGenerator: MenuOption[] | (() => MenuOption[]),
  width: number,
  height: number
): MenuOption[] {
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
    ] as [ImageProperties, string];
  });
}
