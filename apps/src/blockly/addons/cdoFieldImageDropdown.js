import {FieldGridDropdown} from '@blockly/field-grid-dropdown';
import color from '@cdo/apps/util/color';

// Note that this class *does not* inherit from CdoFieldDropdown
export class CdoFieldImageDropdown extends FieldGridDropdown {
  constructor(menuGenerator, width, height, buttons) {
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
   * 1. Override primaryColour to always be white. The Blockly team is planning
   * to change FieldGridDropdown to make the dropdown color configurable. Once that
   * change is shipped, we can remove the custom logic here.
   * 2. Create MenuItems for the buttons and add them before we render the menu.
   */
  showEditor_(opt_e = undefined) {
    this.dropdownCreate_();
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
      const numItems = this.menu_.menuItems.length;
      const numInLastRow = numItems % this.columns_;
      const numBlankToAdd = numInLastRow > 0 ? this.columns_ - numInLastRow : 0;
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
          Blockly.DropDownDiv.hideIfOwner(this, true)
        );
        const menuItem = new Blockly.MenuItem(buttonElement, '');
        menuItem.setRole(Blockly.utils.aria.Role.OPTION);
        menuItem.setRightToLeft(this.sourceBlock_.RTL);
        menuItem.setEnabled(false);
        this.menu_.addChild(menuItem);
      });
    }

    // Element gets created in render.
    this.menu_.render(Blockly.DropDownDiv.getContentDiv());
    var menuElement = /** @type {!Element} */ (this.menu_.getElement());
    Blockly.utils.dom.addClass(menuElement, 'blocklyDropdownMenu');

    const primaryColour = color.white;
    const borderColour = this.sourceBlock_.isShadow()
      ? this.sourceBlock_.getParent().style.colourTertiary
      : this.sourceBlock_.style.colourTertiary;
    Blockly.DropDownDiv.setColour(primaryColour, borderColour);

    // Focusing needs to be handled after the menu is rendered and positioned.
    // Otherwise it will cause a page scroll to get the misplaced menu in
    // view. See issue #1329.
    this.menu_.focus();

    if (this.selectedMenuItem_) {
      this.menu_.setHighlighted(this.selectedMenuItem_);
    }

    this.applyColour();

    Blockly.utils.dom.addClass(
      this.menu_.getElement(),
      'fieldGridDropDownContainer'
    );
    this.updateColumnsStyling_();

    Blockly.DropDownDiv.showPositionedByField(
      this,
      this.dropdownDispose_.bind(this)
    );
  }
}

export function fixMenuGenerator(menuGenerator, width, height) {
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
    let url = menuItem[0];
    let code_id = menuItem[1];
    // TODO: add better alt text. For now, it's just using the code name for the
    // image, but that's not necessarily a student-friendly string. (for example,
    // in Basketball, the hand dropdown has hand_1, hand_2, and hand_3, which might
    // benefit from more descriptive alt text.)
    return [{src: url, width: width, height: height, alt: code_id}, code_id];
  });
}
