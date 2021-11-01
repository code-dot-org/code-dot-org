import {FieldGridDropdown} from '@blockly/field-grid-dropdown';
import color from '@cdo/apps/util/color';

export class CdoFieldImageDropdown extends FieldGridDropdown {
  constructor(menuGenerator, width, height, buttons) {
    super(
      () => fixMenuGenerator(menuGenerator, width, height),
      undefined /* validator */,
      {columns: 7}
    );
  }

  showEditor_(e = undefined) {
    super.showEditor_(e);

    // Override so that grid dropdown is white.
    const primaryColour = color.white;
    const borderColour = this.sourceBlock_.isShadow()
      ? this.sourceBlock_.getParent().style.colourTertiary
      : this.sourceBlock_.style.colourTertiary;
    Blockly.DropDownDiv.setColour(primaryColour, borderColour);
  }
}

function fixMenuGenerator(menuGenerator, width, height) {
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

export var __TestInterface = {
  fixMenuGenerator: fixMenuGenerator
};
